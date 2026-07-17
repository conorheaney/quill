#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use base64::{engine::general_purpose::STANDARD as BASE64_STANDARD, Engine as _};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct MarkdownFileResult {
    content: String,
    file_name: String,
    file_path: String,
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
    MarkdownFileResult {
        file_name: file_name_from_path(&file_path),
        file_path: file_path.to_string_lossy().into_owned(),
        content,
    }
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

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            read_markdown_file,
            read_image_data_url,
            write_markdown_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running Quill Tauri application");
}
