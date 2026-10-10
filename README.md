Key features

- CSV Upload: Upload pricing feeds containing store, product, SKU, price, and pricing date information.
- Data Validation: Validate uploaded CSV files and their contents before processing.
- Pricing Listing: View stored pricing records in a structured table.
- Search and Filtering: Search for pricing records using supported criteria such as Store ID, SKU, Product Name, and Date.
- Pagination: Retrieve pricing records in manageable pages instead of loading the entire dataset at once.
- Edit Pricing: Modify an existing pricing record and save the changes.
- REST API Integration: Communicate between the React frontend and FastAPI backend through REST endpoints.
- Persistent Storage: Store pricing records in a relational database.
- Responsive Interface: Provide a clean interface for managing pricing information.

Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, JavaScript, CSS |
| Backend | Python, FastAPI |
| ORM | SQLAlchemy |
| Database | SQLite for the current local implementation |
| API Format | REST, JSON |
| File Processing | Python CSV processing |
| API Documentation | FastAPI Swagger UI |
| Version Control | Git |

Database note: SQLite is used for local development because a separate database server is not required. PostgreSQL can be adopted for a production deployment or a shared multi-user environment.

Solution Architecture

The application follows a layered architecture to separate responsibilities and reduce coupling between components.

```text
                 User
                   |
                   v
          React Frontend
        (JavaScript + CSS)
                   |
                   v
            FastAPI REST API
                   |
                   v
             Route Layer
                   |
                   v
            Service Layer
       (Business Logic and Validation)
                   |
                   v
          Repository / ORM Layer
               (SQLAlchemy)
                   |
                   v
               Database
                (SQLite)
```

Component Responsibilities

Frontend Layer
- Provides the user interface for uploading CSV files.
- Displays pricing records and search results.
- Supports pagination and record editing.
- Sends API requests and displays success or error messages.

API Layer
- Exposes REST endpoints for uploading, retrieving, searching, and updating pricing records.
- Validates incoming requests.
- Returns structured responses and appropriate HTTP status codes.

Service Layer
- Handles business rules and pricing-related operations.
- Coordinates CSV parsing, validation, and persistence.
- Keeps business logic separate from HTTP request handling.

Repository and Database Layer
- Uses SQLAlchemy to interact with the database.
- Performs database queries and updates.
- Stores pricing records persistently.

Data Model

The primary entity is `PricingRecord`.

| Field | Description |
|---|---|
| `id` | Unique identifier for a pricing record |
| `store_id` | Identifier of the retail store |
| `sku` | Stock Keeping Unit identifying the product |
| `product_name` | Name of the product |
| `price` | Product price |
| `price_date` | Date associated with the price |
| `created_at` | Timestamp when the record was created |
| `updated_at` | Timestamp when the record was last updated |

Database Indexing

An index is defined on the combination of `store_id`, `sku`, and `price_date` to help optimize queries that filter by these fields.

Additional indexes can be introduced based on actual query patterns and performance testing.

Example CSV Format

```csv
Store ID,SKU,Product Name,Price,Date
STORE001,SKU1001,Wireless Mouse,24.99,2026-10-01
STORE002,SKU1002,Keyboard,39.99,2026-10-02
STORE003,SKU1003,Monitor,199.99,2026-10-03
```

The CSV headers and date format must match the format supported by the implemented parser.

CSV Upload Workflow

1. The user selects a CSV file through the frontend.
2. The frontend submits the file to the upload API.
3. The backend checks the file type, file contents, and applicable validation rules.
4. The CSV parser extracts and validates pricing records.
5. The service layer processes valid records and persists them through SQLAlchemy.
6. The API returns a success or error response.
7. The frontend displays the result and can refresh the pricing list.

Invalid files and malformed records should be handled with clear error messages. Where appropriate, database transactions should prevent partially persisted data when an upload fails.

Search, Pagination, and Editing

Search and Filtering

Users can narrow pricing records using the supported search fields. Filtering should be performed on the backend so that results remain correct when the dataset grows.

Pagination

The listing API should accept pagination parameters such as `page` and `page_size`, or `skip` and `limit`. The backend should return the requested subset of records along with sufficient metadata to navigate between pages.

Editing

Users can edit an existing record and submit the changes through the update API. The backend validates the submitted values and persists the update to the database.

The application should display validation errors without silently discarding user changes.
Non-Functional Requirements

 Performance
- Use database-side filtering and pagination to reduce unnecessary data transfer.
- Apply appropriate database indexes to frequently queried fields.
- Avoid loading the entire pricing dataset into the browser.

Scalability
- Keep frontend, API, business logic, and persistence concerns separated.
- Support future migration to PostgreSQL and deployment on cloud infrastructure.
- Consider asynchronous or background processing for large CSV uploads.

Reliability and Data Integrity
- Validate incoming pricing data before persistence.
- Use database transactions for operations that must succeed or fail as a unit.
- Return meaningful error responses for invalid requests and failed operations.

Security
- Validate uploaded files and restrict accepted formats.
- Enforce reasonable upload size limits.
- Apply authentication and role-based authorization before production deployment.
- Store secrets in environment variables or a managed secrets service rather than source code.

Maintainability and Testability
- Organize the backend into routes, services, repositories, schemas, and models.
- Keep frontend features in separate reusable components.
- Use automated unit and integration tests for critical business logic and API behavior.

10. Design Decisions

React with JavaScript: Chosen to build a component-based interface while keeping the frontend implementation straightforward.

FastAPI: Provides typed request and response validation, REST API development, and automatically generated interactive API documentation.

SQLAlchemy: Separates database operations from business logic and supports migration to other relational databases.

SQLite for local development: Avoids requiring a separately installed database server and simplifies local setup. PostgreSQL is a suitable next step for a production environment requiring concurrent access and centralized persistence.

Layered backend architecture: Separates API handling, business logic, and database access to improve maintainability and testing.

Server-side pagination and filtering: Reduces payload sizes and supports efficient browsing of large datasets.

