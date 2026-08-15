#[test]
fn rust_test_layer_is_wired_into_the_canonical_command() {
    assert_ne!(
        std::env::var("QUILL_TEST_SEED_FAILURE").ok().as_deref(),
        Some("rust"),
        "Controlled Rust test-layer failure was requested."
    );
}
