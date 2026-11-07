use std::net::TcpStream;
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use std::thread;
use std::time::Duration;

use tauri::RunEvent;

/// Personal install: API + SQLite live in this checkout.
const REPO_ROOT: &str = "/Users/yuvrajsingh/Documents/Personal_Projects/Trackey";
const API_HOST: &str = "127.0.0.1";
const API_PORT: u16 = 8000;

struct ApiProcess {
    child: Option<Child>,
    started_by_us: bool,
}

fn api_ready() -> bool {
    TcpStream::connect((API_HOST, API_PORT)).is_ok()
}

fn uvicorn_bin() -> PathBuf {
    PathBuf::from(REPO_ROOT).join(".venv/bin/uvicorn")
}

fn start_api_if_needed() -> ApiProcess {
    if api_ready() {
        return ApiProcess {
            child: None,
            started_by_us: false,
        };
    }

    let uvicorn = uvicorn_bin();
    if !uvicorn.exists() {
        eprintln!("Trackey: missing API binary at {}", uvicorn.display());
        return ApiProcess {
            child: None,
            started_by_us: false,
        };
    }

    match Command::new(&uvicorn)
        .args([
            "app.main:app",
            "--host",
            API_HOST,
            "--port",
            &API_PORT.to_string(),
        ])
        .current_dir(REPO_ROOT)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
    {
        Ok(child) => {
            // Block until the API accepts connections so the UI never boots cold.
            for _ in 0..100 {
                if api_ready() {
                    break;
                }
                thread::sleep(Duration::from_millis(100));
            }
            ApiProcess {
                child: Some(child),
                started_by_us: true,
            }
        }
        Err(err) => {
            eprintln!("Trackey: failed to start API: {err}");
            ApiProcess {
                child: None,
                started_by_us: false,
            }
        }
    }
}

fn stop_api(state: &Mutex<ApiProcess>) {
    if let Ok(mut guard) = state.lock() {
        if !guard.started_by_us {
            return;
        }
        if let Some(mut child) = guard.child.take() {
            let _ = child.kill();
            let _ = child.wait();
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Start FastAPI before the window appears — one app, one lifecycle.
    let api = Mutex::new(start_api_if_needed());

    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building Trackey")
        .run(move |_app_handle, event| {
            if matches!(event, RunEvent::Exit | RunEvent::ExitRequested { .. }) {
                stop_api(&api);
            }
        });
}
