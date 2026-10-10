
import csv
from datetime import date
from decimal import Decimal, InvalidOperation
from io import StringIO


REQUIRED_HEADERS = {
    "store id",
    "sku",
    "product name",
    "price",
    "date",
}


def normalize_header(header: str) -> str:
    return header.strip().lower()


def parse_pricing_csv(file_content: bytes):
    """
    Validate a CSV file and return valid records and row-level errors.
    """
    try:
        text = file_content.decode("utf-8-sig")
    except UnicodeDecodeError:
        raise ValueError("CSV file must use UTF-8 encoding.")

    reader = csv.DictReader(StringIO(text))

    if not reader.fieldnames:
        raise ValueError("CSV file is empty or has no header row.")

    # Map original header names to normalized names.
    header_map = {
        normalize_header(header): header
        for header in reader.fieldnames
        if header is not None
    }

    missing_headers = REQUIRED_HEADERS - set(header_map)

    if missing_headers:
        raise ValueError(
            "Missing required columns: "
            + ", ".join(sorted(missing_headers))
        )

    valid_records = []
    errors = []

    for row_number, row in enumerate(reader, start=2):
        try:
            store_id = (row.get(header_map["store id"]) or "").strip()
            sku = (row.get(header_map["sku"]) or "").strip()
            product_name = (
                row.get(header_map["product name"]) or ""
            ).strip()
            price_text = (row.get(header_map["price"]) or "").strip()
            date_text = (row.get(header_map["date"]) or "").strip()

            if not store_id:
                raise ValueError("Store ID is required.")

            if not sku:
                raise ValueError("SKU is required.")

            if not product_name:
                raise ValueError("Product Name is required.")

            try:
                price = Decimal(price_text)
            except InvalidOperation:
                raise ValueError("Price must be a valid decimal.")

            if not price.is_finite():
                raise ValueError("Price must be a finite number.")

            if price < 0:
                raise ValueError("Price cannot be negative.")

            if price.as_tuple().exponent < -2:
                raise ValueError(
                    "Price cannot have more than two decimal places."
                )

            if price >= Decimal("100000000"):
                raise ValueError("Price exceeds the maximum allowed value.")

            try:
                price_date = date.fromisoformat(date_text)
            except ValueError:
                raise ValueError("Date must use YYYY-MM-DD format.")

            valid_records.append({
                "store_id": store_id,
                "sku": sku,
                "product_name": product_name,
                "price": price,
                "price_date": price_date,
            })

        except ValueError as exc:
            errors.append({
                "row": row_number,
                "error": str(exc),
            })

    return valid_records, errors