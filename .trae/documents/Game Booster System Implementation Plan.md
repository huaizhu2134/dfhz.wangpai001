# Implementation Plan: Game Booster System

## 1. Data Model & Cloud Functions Updates
### Data Model (Schema)
*   **`shop_user`**: Add fields for booster identity.
    *   `isBooster`: boolean (default false)
    *   `boosterStatus`: string ('none' | 'pending' | 'approved' | 'rejected')
    *   `realName`: string
    *   `boosterWechat`: string
*   **`shop_order`**: Add fields for booster logic.
    *   `boosters`: array of strings (user IDs of boosters who took the order)
    *   `maxBoosters`: number (default 1, max 3)
    *   `boosterStatus`: string (e.g., 'WAITING', 'FULL') - optional, can be derived.

### Cloud Functions
*   **`update_user`**: Ensure it supports updating the new booster fields.
*   **`booster_order_ops`** (New Function): Handle concurrent order operations.
    *   `action: 'takeOrder'`: Atomically add user to `boosters` list if `size < maxBoosters`.
    *   `action: 'increaseManpower'`: Update `maxBoosters` (only allowed for the first booster).
    *   `action: 'getSquareOrders'`: List orders with `status=TO_SEND` and `boosters.length < maxBoosters`.

## 2. Frontend - Booster Registration
### User Center (`pages/usercenter/index`)
*   Add a "Become a Booster" cell/button.
*   Show status tag (e.g., "Reviewing") if applied.

### Registration Page (`pages/usercenter/apply-booster/index`)
*   Form: Real Name, WeChat Account.
*   Submit: Calls `update_user` to set `boosterStatus = 'pending'`, `realName`, `boosterWechat`.

## 3. Frontend - Order Square
### Home Page (`pages/home/home`)
*   Add "Order Square" navigation entry (visible only if `boosterStatus === 'approved'`).

### Order Square Page (`pages/order/square/index`)
*   List orders fetched via `booster_order_ops`.
*   Display: Order Info, Price (Reward), Current/Max Boosters.
*   Interaction:
    *   "Take Order" button: Calls `booster_order_ops.takeOrder`.
    *   "Increase Manpower" button: Visible on orders where current user is the first booster. Calls `booster_order_ops.increaseManpower`.

## 4. Frontend - Order Detail (Booster View)
*   (Optional for MVP) specialized view for boosters to see order details.

## 5. Compensation (Basic)
*   Calculate reward as a fixed percentage (e.g., 80%) of the order price for display in the Square.

## Verification
*   Verify registration flow updates user status.
*   Verify "Order Square" only shows for approved boosters.
*   Verify taking an order updates the `boosters` list and UI.
*   Verify "Increase Manpower" works and allows more boosters to join.
