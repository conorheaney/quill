import type {
  CodeImageToolOptions,
  CodeImageToolPort,
  CodeToken
} from "./contracts";

class CodeImageTool implements CodeImageToolPort {
  private readonly languageMeta: CodeImageToolOptions["languageMeta"];
  private readonly escapeHtml: CodeImageToolOptions["escapeHtml"];

  public constructor(options: CodeImageToolOptions) {
    this.languageMeta = options.languageMeta;
    this.escapeHtml = options.escapeHtml;
  }

  public highlightCodeHtml(language: string, code: string): string {
    return this.tokenizeCode(language, code)
      .map((lineTokens) => lineTokens
        .map((token) => `<span class="token-${token.type}">${this.escapeHtml(token.value)}</span>`)
        .join(""))
      .join("\n");
  }

  public createCodeImageMarkdown(language: string, code: string): string {
    const dataUrl = this.renderCodeImage(language, code.replace(/\r\n?/g, "\n"));
    const altText = `Code snippet (${this.languageMeta[language].label})`;
    return `![${altText}](${dataUrl})`;
  }

  private tokenizeLine(language: string, line: string): CodeToken[] {
    const keywordSet = new Set(this.languageMeta[language].keywords);
    const tokens: CodeToken[] = [];
    let index = 0;

    while (index < line.length) {
      const rest = line.slice(index);
      const commentPattern = language === "python" ? /^#.*/ : /^\/\/.*/;
      const commentMatch = rest.match(commentPattern);
      if (commentMatch) {
        tokens.push({ type: "comment", value: commentMatch[0] });
        break;
      }

      const stringMatch = rest.match(/^("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/);
      if (stringMatch) {
        tokens.push({ type: "string", value: stringMatch[0] });
        index += stringMatch[0].length;
        continue;
      }

      const numberMatch = rest.match(/^\b\d+(?:\.\d+)?\b/);
      if (numberMatch) {
        tokens.push({ type: "number", value: numberMatch[0] });
        index += numberMatch[0].length;
        continue;
      }

      const keywordMatch = rest.match(/^[A-Za-z_][A-Za-z0-9_]*/);
      if (keywordMatch) {
        const value = keywordMatch[0];
        tokens.push({ type: keywordSet.has(value) ? "keyword" : "plain", value });
        index += value.length;
        continue;
      }

      const operatorMatch = rest.match(/^(=>|==={0,1}|!==|!=|<=|>=|&&|\|\||[-+*/%=<>()[\]{}.,:;])/);
      if (operatorMatch) {
        tokens.push({ type: "operator", value: operatorMatch[0] });
        index += operatorMatch[0].length;
        continue;
      }

      tokens.push({ type: "plain", value: rest[0] });
      index += 1;
    }

    return tokens;
  }

  private tokenizeCode(language: string, code: string): CodeToken[][] {
    return code.split("\n").map((line) => this.tokenizeLine(language, line));
  }

  private getTokenColor(type: string): string {
    if (type === "keyword") return "#ff8f70";
    if (type === "string") return "#c3e88d";
    if (type === "number") return "#82aaff";
    if (type === "comment") return "#7f8da3";
    if (type === "operator") return "#89ddff";
    return "#dbe7f3";
  }

  private roundRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, topOnly: boolean): void {
    const bottomRadius = topOnly ? 0 : radius;
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - bottomRadius);
    context.quadraticCurveTo(x + width, y + height, x + width - bottomRadius, y + height);
    context.lineTo(x + bottomRadius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - bottomRadius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
  }

  private renderCodeImage(language: string, code: string): string {
    const tokensByLine = this.tokenizeCode(language, code || "");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas rendering is unavailable.");
    const scale = window.devicePixelRatio || 1;
    const padding = 28;
    const headerHeight = 46;
    const lineHeight = 26;
    const fontSize = 18;
    const fontFamily = "Cascadia Code, Consolas, monospace";

    context.font = `${fontSize}px ${fontFamily}`;
    const lineStrings = tokensByLine.map((lineTokens) => lineTokens.map((token) => token.value).join(""));
    const languageLabel = this.languageMeta[language].label;
    const widestLine = Math.max(...lineStrings.map((line) => context.measureText(line || " ").width), context.measureText(languageLabel).width + 48);
    const width = Math.ceil(widestLine + padding * 2);
    const height = Math.max(160, Math.ceil(headerHeight + padding + tokensByLine.length * lineHeight + padding));

    canvas.width = width * scale;
    canvas.height = height * scale;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.scale(scale, scale);

    context.fillStyle = "#0f172a";
    this.roundRect(context, 0, 0, width, height, 22, false);
    context.fill();
    context.fillStyle = "#162033";
    this.roundRect(context, 0, 0, width, headerHeight, 22, true);
    context.fill();
    context.fillStyle = "#ff8f70";
    context.beginPath();
    context.arc(24, 23, 5, 0, Math.PI * 2);
    context.arc(40, 23, 5, 0, Math.PI * 2);
    context.arc(56, 23, 5, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#dbe7f3";
    context.font = '600 14px "Segoe UI", sans-serif';
    context.fillText(languageLabel, width - padding - context.measureText(languageLabel).width, 28);
    context.font = `${fontSize}px ${fontFamily}`;

    let y = headerHeight + padding;
    tokensByLine.forEach((lineTokens) => {
      let x = padding;
      lineTokens.forEach((token) => {
        context.fillStyle = this.getTokenColor(token.type);
        context.fillText(token.value, x, y);
        x += context.measureText(token.value).width;
      });
      y += lineHeight;
    });

    return canvas.toDataURL("image/png");
  }
}

window.QuillCodeImageTool = {
  create: (options: CodeImageToolOptions): CodeImageToolPort => new CodeImageTool(options)
};

