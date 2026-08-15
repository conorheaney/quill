use super::*;
use std::sync::atomic::{AtomicU64, Ordering};

static NEXT_TEST_DIRECTORY: AtomicU64 = AtomicU64::new(0);

struct TestDirectory {
    path: PathBuf,
}

impl TestDirectory {
    fn new(label: &str) -> Self {
        let sequence = NEXT_TEST_DIRECTORY.fetch_add(1, Ordering::Relaxed);
        let path = std::env::temp_dir().join(format!(
            "quill-ac07-{label}-{}-{sequence}",
            std::process::id()
        ));
        fs::create_dir(&path).expect("create isolated test directory");
        Self { path }
    }

    fn path(&self) -> &Path {
        &self.path
    }
}

impl Drop for TestDirectory {
    fn drop(&mut self) {
        let _ = fs::remove_dir_all(&self.path);
    }
}

#[test]
fn extracts_file_names_from_nested_and_unusual_paths() {
    let cases = [
        ("nested/folder/notes.md", "notes.md"),
        ("nested/folder/review notes #1.md", "review notes #1.md"),
        ("nested/folder/résumé-你好.md", "résumé-你好.md"),
    ];

    for (path, expected) in cases {
        assert_eq!(file_name_from_path(Path::new(path)), expected);
    }
}

#[test]
fn selects_image_mime_types_by_extension_case_insensitively() {
    let cases = [
        ("image.png", "image/png"),
        ("image.JPG", "image/jpeg"),
        ("image.jpeg", "image/jpeg"),
        ("image.gif", "image/gif"),
        ("image.webp", "image/webp"),
        ("image.svg", "image/svg+xml"),
        ("image.bmp", "image/bmp"),
        ("image.unknown", "application/octet-stream"),
        ("image", "application/octet-stream"),
    ];

    for (path, expected) in cases {
        assert_eq!(guess_image_mime_type(Path::new(path)), expected, "{path}");
    }
}

#[test]
fn reads_markdown_from_an_isolated_file() {
    let directory = TestDirectory::new("read");
    let file_path = directory.path().join("read contract.md");
    let content = "# Read contract\n\nBody with ünicode.\n";
    fs::write(&file_path, content).expect("seed markdown file");

    let result =
        read_markdown_file(file_path.to_string_lossy().into_owned()).expect("read markdown file");

    assert_eq!(result.content, content);
    assert_eq!(result.file_name, "read contract.md");
    assert_eq!(PathBuf::from(result.file_path), file_path);
    assert_eq!(result.file_state.size, content.len() as u64);
    assert_eq!(result.file_state.file_path, file_path.to_string_lossy());
    assert!(!result.file_state.content_hash.is_empty());
}

#[test]
fn writes_and_overwrites_markdown_in_an_isolated_file() {
    let directory = TestDirectory::new("write");
    let file_path = directory.path().join("résumé 你好 #1.md");
    let initial = "# First revision\n";
    let replacement = "# Latest revision\n\nSaved safely.\n";

    let first_result = write_markdown_file(WriteMarkdownPayload {
        content: initial.to_string(),
        file_path: file_path.to_string_lossy().into_owned(),
    })
    .expect("write initial markdown");
    assert_eq!(first_result.file_name, "résumé 你好 #1.md");
    assert_eq!(fs::read_to_string(&file_path).unwrap(), initial);

    let replacement_result = write_markdown_file(WriteMarkdownPayload {
        content: replacement.to_string(),
        file_path: file_path.to_string_lossy().into_owned(),
    })
    .expect("overwrite markdown");
    assert_eq!(replacement_result.content, replacement);
    assert_eq!(PathBuf::from(replacement_result.file_path), file_path);
    assert_eq!(replacement_result.file_state.size, replacement.len() as u64);
    assert_eq!(fs::read_to_string(&file_path).unwrap(), replacement);
}

#[test]
fn inspects_current_file_state_and_reports_missing_files() {
    let directory = TestDirectory::new("inspect");
    let file_path = directory.path().join("inspect.md");
    fs::write(&file_path, "# Inspect\n").expect("seed inspect file");

    let first = inspect_markdown_file(file_path.to_string_lossy().into_owned())
        .expect("inspect markdown file");
    assert_eq!(first.size, 10);
    assert!(first.content_hash.is_empty());
    let first_verified = verify_markdown_file(file_path.to_string_lossy().into_owned())
        .expect("verify markdown file");
    assert!(!first_verified.content_hash.is_empty());

    fs::write(&file_path, "# Changed\n").expect("change inspect file");
    let second = verify_markdown_file(file_path.to_string_lossy().into_owned())
        .expect("inspect changed markdown file");
    assert_ne!(first_verified.content_hash, second.content_hash);

    let missing = directory.path().join("missing.md");
    let missing_state = inspect_markdown_file(missing.to_string_lossy().into_owned())
        .expect("missing file state should be inspectable");
    assert!(!missing_state.exists);
}

#[test]
fn rejects_empty_read_and_write_paths() {
    assert_eq!(
        read_markdown_file(" \t\r\n".to_string()).err().unwrap(),
        "A file path is required to read a markdown file."
    );
    assert_eq!(
        write_markdown_file(WriteMarkdownPayload {
            content: "content".to_string(),
            file_path: " \t\r\n".to_string(),
        })
        .err()
        .unwrap(),
        "A file path is required to save a markdown file."
    );
}

#[test]
fn reports_missing_paths_and_representative_io_failures() {
    let directory = TestDirectory::new("io-errors");
    let missing_file = directory.path().join("missing.md");
    let missing_parent_file = directory.path().join("missing-parent").join("notes.md");

    assert!(
        read_markdown_file(missing_file.to_string_lossy().into_owned()).is_err(),
        "reading a missing file must fail"
    );
    assert!(
        read_markdown_file(directory.path().to_string_lossy().into_owned()).is_err(),
        "reading a directory as markdown must fail"
    );
    assert!(
        write_markdown_file(WriteMarkdownPayload {
            content: "content".to_string(),
            file_path: directory.path().to_string_lossy().into_owned(),
        })
        .is_err(),
        "writing markdown to a directory must fail"
    );
    assert!(
        write_markdown_file(WriteMarkdownPayload {
            content: "content".to_string(),
            file_path: missing_parent_file.to_string_lossy().into_owned(),
        })
        .is_err(),
        "writing below a missing parent directory must fail"
    );
}
