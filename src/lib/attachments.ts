/** Chat attachments (IDEA-186): text files are read as text, images are downscaled to JPEG/PNG data URLs. */
export const MAX_ATTACHMENTS = 4;
export const MAX_TEXT_BYTES = 100 * 1024;
export const MAX_IMAGE_INPUT_BYTES = 15 * 1024 * 1024;
/** Keeps a whole request well under the 4.5 MB proxy body limit. */
export const MAX_TOTAL_BYTES = 3.5 * 1024 * 1024;
export const MAX_IMAGE_SIDE = 1600;
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const TEXT_EXTENSIONS = /\.(txt|md|markdown|json|ya?ml|toml|ini|env\.example|csv|tsv|log|xml|html?|css|scss|less|js|jsx|mjs|cjs|ts|tsx|py|rb|go|rs|java|kt|kts|swift|c|h|cc|cpp|hpp|cs|php|sh|bash|zsh|sql|graphql|gql|vue|svelte|dockerfile|gradle|lock|diff|patch)$/i;
export const ACCEPT = [...IMAGE_TYPES, "text/*", "application/json", ".md,.ts,.tsx,.js,.jsx,.py,.go,.rs,.java,.rb,.yml,.yaml,.toml,.sql,.sh,.csv,.log,.diff,.patch"].join(",");

export type Attachment =
  | { id: string; kind: "text"; name: string; size: number; text: string }
  | { id: string; kind: "image"; name: string; size: number; dataUrl: string };

/** What the chat endpoint receives (no ids or sizes). */
export const payloadOf = (items: Attachment[]) => items.map(item => (item.kind === "text" ? { kind: "text", name: item.name, text: item.text } : { kind: "image", name: item.name, dataUrl: item.dataUrl }));
export const bytesOf = (items: Attachment[]): number => items.reduce((sum, item) => sum + (item.kind === "text" ? item.text.length : item.dataUrl.length), 0);
export const formatSize = (bytes: number): string => (bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`);

const isText = (file: File): boolean => file.type.startsWith("text/") || ["application/json", "application/xml", "application/javascript", "application/x-yaml"].includes(file.type) || TEXT_EXTENSIONS.test(file.name);

function readDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(reader.error); reader.readAsDataURL(blob); });
}

/** Large or non-JPEG photos are redrawn at most 1600 px on the long side; small PNG/GIF/WebP stay as they are. */
async function imageDataUrl(file: File): Promise<string> {
  if (file.size <= 400 * 1024 || file.type === "image/gif") return readDataUrl(file);
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL(file.type === "image/png" && scale === 1 ? "image/png" : "image/jpeg", 0.85);
}

let counter = 0;
/** Reads one picked, dropped or pasted file; throws a short plain-words message when it can't be attached. */
export async function readAttachment(file: File): Promise<Attachment> {
  const name = file.name || (file.type.startsWith("image/") ? `pasted-image.${file.type.split("/")[1] ?? "png"}` : "file.txt");
  const id = `att-${Date.now()}-${counter++}`;
  if (IMAGE_TYPES.includes(file.type)) {
    if (file.size > MAX_IMAGE_INPUT_BYTES) throw new Error(`${name} is too large (max ${formatSize(MAX_IMAGE_INPUT_BYTES)}).`);
    const dataUrl = await imageDataUrl(file);
    if (dataUrl.length > 2.6 * 1024 * 1024) throw new Error(`${name} is too large after resizing.`);
    return { id, kind: "image", name, size: file.size, dataUrl };
  }
  if (file.type.startsWith("image/")) throw new Error(`${name}: only PNG, JPEG, WebP and GIF images are supported.`);
  if (!isText(file)) throw new Error(`${name}: only text and code files or images can be attached.`);
  if (file.size > MAX_TEXT_BYTES) throw new Error(`${name} is too large (max ${formatSize(MAX_TEXT_BYTES)} for text files).`);
  const text = await file.text();
  if (text.includes("\u0000")) throw new Error(`${name} looks like a binary file.`);
  return { id, kind: "text", name, size: file.size, text };
}
