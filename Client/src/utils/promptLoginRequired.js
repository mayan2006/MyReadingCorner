/**
 * בטלפון Tooltip כמעט לא מופיע — מציגים חלון ומציעים לעבור להתחברות.
 */
export async function promptLoginRequired(navigate, message) {
  const Swal = globalThis.Swal;
  if (Swal?.fire) {
    const result = await Swal.fire({
      icon: "info",
      title: message,
      confirmButtonText: "התחברות",
      showCancelButton: true,
      showDenyButton: false,
      cancelButtonText: "סגור",
      confirmButtonColor: "#1f5d99",
      cancelButtonColor: "#8a8a8a",
      didOpen: (popup) => {
        popup.setAttribute("dir", "rtl");
      }
    });
    if (result.isConfirmed) {
      navigate("/login");
    }
    return;
  }
  if (window.confirm(message)) {
    navigate("/login");
  }
}
