#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use base64::{engine::general_purpose::STANDARD as BASE64_STANDARD, Engine as _};
use serde::{Deserialize, Serialize};
use std::collections::hash_map::DefaultHasher;
use std::fs;
use std::hash::{Hash, Hasher};
#[cfg(windows)]
use std::os::windows::process::CommandExt;
use std::path::{Path, PathBuf};
use std::process::Command;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct MarkdownFileResult {
    content: String,
    file_name: String,
    file_path: String,
    file_state: FileState,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct FileState {
    exists: bool,
    file_path: String,
    modified_at: u128,
    size: u64,
    content_hash: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct WriteMarkdownPayload {
    content: String,
    file_path: String,
}

fn file_name_from_path(file_path: &Path) -> String {
    file_path
        .file_name()
        .map(|name| name.to_string_lossy().into_owned())
        .unwrap_or_else(|| file_path.to_string_lossy().into_owned())
}

fn build_markdown_result(file_path: PathBuf, content: String) -> MarkdownFileResult {
    let file_state = build_file_state(&file_path, content.as_bytes())
        .expect("file metadata must be available after a successful file operation");
    MarkdownFileResult {
        file_name: file_name_from_path(&file_path),
        file_path: file_path.to_string_lossy().into_owned(),
        content,
        file_state,
    }
}

fn content_hash(content: &[u8]) -> String {
    let mut hasher = DefaultHasher::new();
    content.hash(&mut hasher);
    format!("{:016x}", hasher.finish())
}

fn build_file_state(file_path: &Path, content: &[u8]) -> Result<FileState, String> {
    let metadata = fs::metadata(file_path).map_err(|error| error.to_string())?;
    let modified_at = metadata
        .modified()
        .map_err(|error| error.to_string())?
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|error| error.to_string())?
        .as_millis();
    Ok(FileState {
        exists: true,
        file_path: file_path.to_string_lossy().into_owned(),
        modified_at,
        size: metadata.len(),
        content_hash: content_hash(content),
    })
}

fn guess_image_mime_type(file_path: &Path) -> &'static str {
    match file_path
        .extension()
        .and_then(|extension| extension.to_str())
        .map(|extension| extension.to_ascii_lowercase())
        .as_deref()
    {
        Some("png") => "image/png",
        Some("jpg") | Some("jpeg") => "image/jpeg",
        Some("gif") => "image/gif",
        Some("webp") => "image/webp",
        Some("svg") => "image/svg+xml",
        Some("bmp") => "image/bmp",
        _ => "application/octet-stream",
    }
}

#[tauri::command]
fn read_markdown_file(file_path: String) -> Result<MarkdownFileResult, String> {
    let normalized_path = file_path.trim();
    if normalized_path.is_empty() {
        return Err("A file path is required to read a markdown file.".to_string());
    }

    let target_path = PathBuf::from(normalized_path);
    let content = fs::read_to_string(&target_path).map_err(|error| error.to_string())?;
    Ok(build_markdown_result(target_path, content))
}

#[tauri::command]
fn inspect_markdown_file(file_path: String) -> Result<FileState, String> {
    let normalized_path = file_path.trim();
    if normalized_path.is_empty() {
        return Err("A file path is required to inspect a markdown file.".to_string());
    }

    let target_path = PathBuf::from(normalized_path);
    if !target_path.exists() {
        return Ok(FileState {
            exists: false,
            file_path: target_path.to_string_lossy().into_owned(),
            modified_at: 0,
            size: 0,
            content_hash: String::new(),
        });
    }
    let metadata = fs::metadata(&target_path).map_err(|error| error.to_string())?;
    let modified_at = metadata
        .modified()
        .map_err(|error| error.to_string())?
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|error| error.to_string())?
        .as_millis();
    Ok(FileState {
        exists: true,
        file_path: target_path.to_string_lossy().into_owned(),
        modified_at,
        size: metadata.len(),
        content_hash: String::new(),
    })
}

#[tauri::command]
fn verify_markdown_file(file_path: String) -> Result<FileState, String> {
    let normalized_path = file_path.trim();
    if normalized_path.is_empty() {
        return Err("A file path is required to verify a markdown file.".to_string());
    }

    let target_path = PathBuf::from(normalized_path);
    if !target_path.exists() {
        return Ok(FileState {
            exists: false,
            file_path: target_path.to_string_lossy().into_owned(),
            modified_at: 0,
            size: 0,
            content_hash: String::new(),
        });
    }
    let content = fs::read(&target_path).map_err(|error| error.to_string())?;
    build_file_state(&target_path, &content)
}

#[tauri::command]
fn write_markdown_file(payload: WriteMarkdownPayload) -> Result<MarkdownFileResult, String> {
    let normalized_path = payload.file_path.trim();
    if normalized_path.is_empty() {
        return Err("A file path is required to save a markdown file.".to_string());
    }

    let target_path = PathBuf::from(normalized_path);
    fs::write(&target_path, payload.content.as_bytes()).map_err(|error| error.to_string())?;

    Ok(build_markdown_result(target_path, payload.content))
}

#[tauri::command]
fn read_image_data_url(file_path: String) -> Result<String, String> {
    let normalized_path = file_path.trim();
    if normalized_path.is_empty() {
        return Err("A file path is required to read an image.".to_string());
    }

    let target_path = PathBuf::from(normalized_path);
    let image_bytes = fs::read(&target_path).map_err(|error| error.to_string())?;
    let mime_type = guess_image_mime_type(&target_path);
    let encoded = BASE64_STANDARD.encode(image_bytes);
    Ok(format!("data:{mime_type};base64,{encoded}"))
}

#[tauri::command]
fn reveal_in_explorer(file_path: String) -> Result<(), String> {
    let normalized_path = file_path.trim();
    if normalized_path.is_empty() {
        return Err("A file path is required to open Explorer.".to_string());
    }

    Command::new("explorer.exe")
        .raw_arg(format!("/select,\"{normalized_path}\""))
        .spawn()
        .map(|_| ())
        .map_err(|error| error.to_string())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            read_markdown_file,
            inspect_markdown_file,
            verify_markdown_file,
            read_image_data_url,
            reveal_in_explorer,
            write_markdown_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running Quill Tauri application");
}

#[cfg(test)]
#[path = "../../tests/rust/desktop_commands.rs"]
mod tests;
