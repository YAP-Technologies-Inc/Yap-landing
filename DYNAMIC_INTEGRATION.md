# Dynamic.xyz Integration Guide

## Integration Overview

We've implemented a medium-term solution for integrating Dynamic.xyz wallet functionality with our Angular application:

1. Created a standalone React micro-frontend that handles Dynamic.xyz wallet functionality
2. Wrapped it as a web component that can be consumed by Angular applications
3. Deployed it as a separate service in our Kubernetes cluster
4. Used DOM events for cross-framework communication

This approach resolves the previous integration issues by separating the React-based Dynamic.xyz SDK from our Angular codebase.

## Integration Steps

### 1. Update YAP Landing Angular Module

First, add the CUSTOM_ELEMENTS_SCHEMA to your Angular module:

```typescript
// src/app/app.module.ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  // ...other configuration
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
```

### 2. Add Script Reference

Add the script reference to the web component in `angular.json`:

```json
"scripts": [
  {
    "bundleName": "dynamic-wallet",
    "inject": true,
    "input": "http://dynamic-wallet-react-service/dynamic-wallet-webcomponent.js"
  }
]
```

In development, you may need to use a different URL like:
```
"input": "http://localhost:3001/dynamic-wallet-webcomponent.js"
```

### 3. Use the Web Component in Waitlist

Update your waitlist component template:

```html
<!-- waitlist.component.html -->
<div class="waitlist-container">
  <h2>Join the YAP Waitlist</h2>
  
  <!-- Dynamic Wallet Web Component -->
  <dynamic-wallet-connect
    (wallet-connected)="onWalletConnected($event)">
  </dynamic-wallet-connect>
  
  <!-- Show form after wallet connection -->
  <div *ngIf="walletAddress">
    <!-- Your waitlist form -->
  </div>
</div>
```

### 4. Handle Wallet Connection in Component

```typescript
// waitlist.component.ts
walletAddress: string | null = null;
dynamicUserId: string | null = null;

onWalletConnected(event: CustomEvent) {
  this.walletAddress = event.detail.walletAddress;
  this.dynamicUserId = event.detail.userId;
  
  // Pre-fill form fields
  this.waitlistForm.patchValue({
    walletAddress: this.walletAddress,
    dynamicUserId: this.dynamicUserId
  });
}
```

## Configuration

The Dynamic Wallet service reads these environment variables from Kubernetes secrets:

- `DYNAMIC_ENV_ID`: Environment ID for the Dynamic.xyz SDK (from auth-secrets)
- `DYNAMIC_API_KEY`: API key for the Dynamic.xyz SDK (from auth-secrets)

## Testing

1. Make sure the `dynamic-wallet-react` service is running in your Kubernetes cluster
2. Run the YAP Landing application
3. Navigate to the waitlist page
4. Connect your wallet using the Dynamic component
5. Verify that the wallet address and Dynamic user ID are captured in the form

## Benefits of This Approach

- Separates React dependencies from Angular codebase
- Uses real Dynamic.xyz SDK functionality, not a mock
- Web Components provide clean integration between frameworks
- The service can be reused across multiple applications (landing page, frontend app)
- Configuration uses existing Kubernetes secrets
