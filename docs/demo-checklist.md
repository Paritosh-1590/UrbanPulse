# Faculty demonstration sequence

1. Start MongoDB, the Express API, the Vite frontend, and (optionally) the Python classifier service.
2. Open the public landing page and explain the citizen/admin split.
3. Register a new citizen account and sign in.
4. Submit an issue with a descriptive title, description, selected category and location. Use **Suggest category with AI** and show the returned category/source label. Submit the report.
5. Open the complaint detail page. Show its complaint ID, selected category, priority, target deadline and activity history.
6. Open **My Complaints**. Search for the complaint ID and demonstrate the status filter.
7. Sign out. Sign in with the admin account provisioned through `npm run seed:admin`.
8. Open the administrator queue. Search for the complaint and open it.
9. Assign a department. Optionally create a department official account from the dashboard and assign that official to the complaint.
10. Update the status to **In Progress**, add a short note, and show the new activity-history entry.
11. Sign out and sign in as the department official (if one was created). Show that this account sees its own department queue and can update an assigned complaint to **Resolved**.
12. Sign back in as the citizen and show the updated complaint status/history.

Do not claim SLA emails, map functionality, image uploads, official municipal integration, or real-world ML accuracy. For an overdue SLA demonstration, use a controlled test record or temporarily set an old deadline in a local development database; do not manipulate a real submission.
