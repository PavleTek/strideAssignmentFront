# Frontend

To run this locally, you must run the following commands:

```bash
npm install
npm run dev
```

For building, you should run:

```bash
npm run build
```

## Deployment to Railway

To deploy to Railway:

1. Clone this repository
2. Connect your new repository to Railway
3. The `package.json` already has the necessary commands for Railway to run automatically
4. Add the following variable to the service variables section in Railway:
   - **Variable name**: `NEXT_PUBLIC_API_BASE_URL`
   - **Value**: The URL provided by the backend service from Railway (can be found in the backend settings under the networking section)
