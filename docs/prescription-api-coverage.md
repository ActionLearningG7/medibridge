# Prescription Microservice API Coverage

This document outlines the API endpoints exposed by the Prescription Microservice and their mapping to the frontend implementation plan.

## 1. Admin Controller
**Base URL**: `/api/v1/admin/orders`

| Endpoint | Method | Auth | Frontend Mapping | Status |
| :--- | :--- | :--- | :--- | :--- |
| `/{orderId}/status` | PATCH | `ADMIN` | **Admin Tools > Medicine Orders**<br>Action: Update Order Status | ⏳ PENDING |

## 2. Doctor Prescription Controller
**Base URL**: `/api/v1/prescriptions`

| Endpoint | Method | Auth | Frontend Mapping | Status |
| :--- | :--- | :--- | :--- | :--- |
| `/` | POST | `DOCTOR` | **Doctor Dashboard > Consultation**<br>Action: Create Prescription after consultation | ⏳ PENDING |
| `/{id}/issue` | POST | `DOCTOR` | **Doctor Dashboard > Consultation**<br>Action: Issue/Finalize Prescription | ⏳ PENDING |

## 3. Patient Order Controller
**Base URL**: `/api/v1/orders`

| Endpoint | Method | Auth | Frontend Mapping | Status |
| :--- | :--- | :--- | :--- | :--- |
| `/` | POST | `PATIENT` | **Patient Dashboard > Pharmacy**<br>Action: Place Medicine Order | ⏳ PENDING |
| `/me` | GET | `PATIENT` | **Patient Dashboard > My Orders**<br>Page: List of past/active medicine orders | ⏳ PENDING |

## 4. Patient Prescription Controller
**Base URL**: `/api/v1/prescriptions`

| Endpoint | Method | Auth | Frontend Mapping | Status |
| :--- | :--- | :--- | :--- | :--- |
| `/me` | GET | `PATIENT` | **Patient Dashboard > My Prescriptions**<br>Page: List of received prescriptions | ⏳ PENDING |
| `/{id}` | GET | `PATIENT`, `DOCTOR` | **Shared > Prescription Details**<br>Page: View full prescription details | ⏳ PENDING |

## Summary
- **Total Endpoints**: 7
- **Admin**: 1
- **Doctor**: 2 (+1 Shared)
- **Patient**: 3 (+1 Shared)
