# Workshop Management System

A simple workshop management demo with a welcome page and separate customer, receptionist, technician, and admin work areas.

## Run it

Keep `index.html`, `styles.css`, `app.js`, and `workshop-background.jpg` together. Open `index.html` in a browser. No installation or external website is required.

## Demo admin account

- Email: `admin@workshop.com`
- Password: `admin123`

## Demo staff accounts

- Technician: `tech@workshop.com` / `tech123`
- Receptionist: `reception@workshop.com` / `front123`

The admin sees all requests and reports, can add or remove staff accounts, manage inventory stock, set service prices, and access request approval and billing. Reception handles customer and vehicle bookings, creates and edits job cards, assigns technicians, records customer approval, and enters final bills. A new request's selected service price is the starting bill. Technicians see unassigned jobs and jobs assigned to them, update work progress, and log parts used. Part options show each unit price and stock; logging a part reduces stock and adds its cost to the bill. Customers see their request status, approval, technician assignment, estimate, and bill. Notifications connect the roles when requests, assignments, approvals, billing, status, and parts change.

Customers can register a new account from the welcome page. The login welcome section explains the customer service workflow. The service form has separate year, company, and model selectors. Customers can choose "Other" and type an unlisted year, company, or model. The suggested model list changes to match the selected company. Customers choose an appointment date, enter an initial complaint, and can choose "Other" to describe a different service. Customers can edit their own requests while the status is still New.

To demonstrate the workflow, sign in as a customer and submit a request. Sign in as reception to approve it and record billing, then sign in as a technician to move the job forward and log parts. After staff set a request to Completed, the customer sees the supplied payment QR image with that request. Keep `payment-qr.jpeg` beside `index.html` so the relative image path continues to work. The notification button in the top-right corner lists account, request, and status notices. The admin dashboard includes search, filters, inventory, prices, staff, and a simple overall report. The login-page footer includes the supplied query contact details.

## Storage note

This demo saves data and notifications in the current browser's local storage. The roles share records when they use the same browser storage, and other tabs in that browser can refresh their views when data changes. Accounts and requests are not shared with another computer or browser. A shared online system requires a server and database. Password handling here is for demonstration only and is not secure for real users.
