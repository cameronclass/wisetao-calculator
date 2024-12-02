export async function loadJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to load JSON");
    return await response.json();
  } catch (error) {
    console.error("JSON не подгрузился:", error);
    return null;
  }
}
