# FARMSTOCK — REST API Documentation

Base URL: `http://localhost:5000/api`

## Authentication
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/signup` | Register a new farmer or user | No |
| `POST` | `/auth/login` | Authenticate and obtain JWT token | No |
| `POST` | `/auth/logout` | Clear session and cookies | No |
| `GET` | `/auth/me` | Fetch authenticated user details & counts | Yes |

## Products & Machinery
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/products` | Query machinery with filters (category, price, state, condition) | No |
| `GET` | `/products/featured` | Fetch top-viewed machinery for homepage | No |
| `GET` | `/products/:id` | Fetch complete specs, gallery & owner info | No |
| `GET` | `/products/my/listings` | Fetch current user's machinery listings | Yes |
| `POST` | `/products` | Publish a new equipment listing | Yes |
| `PATCH` | `/products/:id` | Update equipment specifications or status | Yes (Owner/Admin) |
| `DELETE` | `/products/:id` | Delete equipment listing | Yes (Owner/Admin) |
| `POST` | `/products/upload-images` | Upload up to 8 machinery photos | Yes |

## Categories
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/categories` | List active categories with equipment counts | No |
| `POST` | `/categories` | Create new equipment category | Yes (Admin) |
| `PATCH` | `/categories/:id` | Update category name or icon | Yes (Admin) |

## Purchase & Rental Requests
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/requests/purchase` | Send purchase price offer to owner | Yes |
| `GET` | `/requests/purchase/sent` | List purchase offers made by user | Yes |
| `GET` | `/requests/purchase/received` | List purchase offers received by owner | Yes |
| `PATCH` | `/requests/purchase/:id/status` | Update status (ACCEPTED, REJECTED, COMPLETED) | Yes |
| `POST` | `/requests/rental` | Book equipment with collision checks | Yes |
| `GET` | `/requests/rental/sent` | List rental booking requests sent | Yes |
| `GET` | `/requests/rental/received` | List rental booking requests received | Yes |
| `PATCH` | `/requests/rental/:id/status` | Update rental status (APPROVED, ACTIVE, etc.) | Yes |

## Cart & Wishlist
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/cart` | Fetch user's cart items with subtotal | Yes |
| `POST` | `/cart/items` | Add eligible machinery to cart | Yes |
| `PATCH` | `/cart/items/:id` | Update item quantity | Yes |
| `DELETE` | `/cart/items/:id` | Remove item from cart | Yes |
| `DELETE` | `/cart` | Clear entire shopping cart | Yes |
| `GET` | `/wishlist` | Fetch saved equipment items | Yes |
| `POST` | `/wishlist/toggle` | Toggle equipment in wishlist | Yes |

## Real-Time Chat
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/chat/conversations` | List user's active chat conversations | Yes |
| `POST` | `/chat/conversations` | Start or retrieve conversation with owner | Yes |
| `GET` | `/chat/conversations/:id/messages` | Fetch message history for conversation | Yes |
| `POST` | `/chat/conversations/:id/messages` | Send message (REST fallback) | Yes |

## Admin & Governance
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/metrics` | Platform overview KPIs | Yes (Admin) |
| `GET` | `/admin/users` | List registered users with status | Yes (Admin) |
| `PATCH` | `/admin/users/:id/status` | Suspend or reactivate user | Yes (Admin) |
| `GET` | `/admin/products` | All listings for moderation | Yes (Admin) |
| `PATCH` | `/admin/products/:id/moderation` | Approve or reject listing | Yes (Admin) |
| `GET` | `/admin/analytics` | Category & regional distribution data | Yes (Admin) |
| `GET` | `/reports/admin` | List open reports & complaints | Yes (Admin) |
| `PATCH` | `/reports/admin/:id` | Resolve user report | Yes (Admin) |
