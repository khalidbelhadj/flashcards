const params = new URLSearchParams(window.location.search);

export function isNewCardMode(): boolean {
  return params.get("mode") === "new-card";
}
