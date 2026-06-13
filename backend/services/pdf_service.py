import fitz


def extract_text_from_pdf(file_bytes: bytes) -> str:
    with fitz.open(stream=file_bytes, filetype="pdf") as document:
        page_texts: list[str] = []

        for page in document:
            page_texts.append(page.get_text())

        return "\n".join(page_texts).strip()[:12000]
