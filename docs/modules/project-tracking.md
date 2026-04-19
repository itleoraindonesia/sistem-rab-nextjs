# Project Tracking Module

## Overview
Modul untuk memonitor hubungan antara progress pekerjaan vendor, pembayaran ke vendor, dan pembayaran dari customer dalam satu project. Sistem menghitung weighted project progress berdasarkan nilai SPK vendor.

## Business Logic

### Weighted Project Progress
```sql
Project Progress = Σ(nilai_spk_vendor × progress_vendor) / Σ(nilai_spk_vendor)
```

- **Data Source**: `vendor_progress.progress_percent` terbaru per vendor
- **Filter**: Hanya vendor dengan `vendor_spk.status = 'active'`
- **Calculation**: Weighted average berdasarkan nilai SPK

### Cash Flow Analysis
```sql
Cash Flow Aktual = Customer Paid - Vendor Paid
Projected Margin = contract_value - Total SPK
Margin % = Projected Margin / contract_value × 100
```

- **Warning**: Jika `Cash Flow Aktual < 0` (Vendor Paid > Customer Paid)
- **Alert**: Jika `Customer Outstanding > 50% contract_value`

### Retensi (Optional)
```sql
Nilai Retensi = nilai_spk × retensi_persen / 100
Nilai Bersih SPK = nilai_spk - Nilai Retensi
```

- **Payment**: Retensi dibayar setelah `vendor_spk.status = 'completed'`

### Project Timeline
```sql
Sisa Hari = tanggal_deadline - today
```

- **Overdue**: `sisa_hari <= 0`
- **Warning**: `sisa_hari <= 14`

## Database Schema

### projects
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| nama_project | text | Project name |
| customer | text | Customer name |
| contract_value | numeric | Total contract value |
| tanggal_mulai | date | Start date |
| tanggal_deadline | date | Deadline |
| retensi_persen | numeric | Retention percentage (0-100) |
| status | text | `active` \| `completed` \| `cancelled` |

### vendor_spk
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| project_id | uuid | FK → projects |
| nama_vendor | text | Vendor name |
| nilai_spk | numeric | SPK value |
| retensi_persen | numeric | Vendor retention % |
| status | text | `active` \| `completed` |
| lampiran_url | text | SPK file URL |

### vendor_progress
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| vendor_spk_id | uuid | FK → vendor_spk |
| tanggal | date | Progress date |
| progress_percent | numeric | 0-100 |
| catatan | text | Notes |
| lampiran_url | text | BA progress URL |

### vendor_payment
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| vendor_spk_id | uuid | FK → vendor_spk |
| tanggal | date | Payment date |
| jenis_pembayaran | text | `dp` \| `term` \| `pelunasan` |
| jumlah | numeric | Payment amount |
| catatan | text | Notes |
| lampiran_url | text | Invoice URL |

### customer_payment
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| project_id | uuid | FK → projects |
| tanggal | date | Payment date |
| termin | text | `dp` \| `term` \| `final` |
| jumlah | numeric | Payment amount |
| catatan | text | Notes |
| lampiran_url | text | Receipt URL |

## Data Relationships

```
projects (1)
├── customer_payment (many) - Revenue from customer
└── vendor_spk (many) - Contracts with vendors
    ├── vendor_progress (many) - Progress history
    └── vendor_payment (many) - Payment history
```

## Key Calculations (Summary View)

| Metric | Formula |
|--------|---------|
| Project Progress | Weighted avg progress by SPK value |
| Total SPK | Σ nilai_spk all vendors |
| Vendor Paid | Σ jumlah from vendor_payment |
| Vendor Outstanding | Total SPK - Vendor Paid |
| Customer Paid | Σ jumlah from customer_payment |
| Customer Outstanding | contract_value - Customer Paid |
| Cash Flow Aktual | Customer Paid - Vendor Paid |
| Projected Margin | contract_value - Total SPK |
| Projected Margin % | Projected Margin / contract_value × 100 |
| Sisa Hari | deadline - today |

## UI/UX Design

### Alert & Warning System
- **Cash Flow Negative**: Red badge in summary
- **High Customer Outstanding**: Orange alert (>50% contract)
- **Deadline Warning**: Yellow badge (≤14 days)
- **Overdue**: Red badge (deadline passed)

### Vendor SPK Table
- **Weight Column**: % contribution to total SPK
- **Progress Visualization**: Progress bars per vendor
- **Payment Status**: Color-coded payment completion

### Tab Structure
1. **Overview**: Summary metrics + progress chart
2. **Vendor SPK**: List of vendor contracts
3. **Progress Vendor**: Progress tracking per vendor
4. **Pembayaran Vendor**: Payment history to vendors
5. **Pembayaran Customer**: Payment received from customer

### File Attachments
- **SPK Documents**: Contract files per vendor
- **Progress Reports**: BA progress attachments
- **Payment Proofs**: Invoices, receipts, transfer proofs
- **Icon Indicators**: Paperclip icon when files attached

## Validation Rules

### Business Rules
- `progress_percent`: 0-100
- `vendor_payment.jumlah`: Cannot exceed `vendor_spk.nilai_spk`
- `customer_payment.jumlah`: Cannot exceed `projects.contract_value`
- `retensi_persen`: 0-100
- Status enums: Strict validation

### Data Integrity
- Foreign key constraints
- Cascade deletes where appropriate
- Audit trails for changes
- Unique constraints on critical fields

## Integration Points

### With CRM Module
- **Lead Conversion**: CRM leads become projects
- **Customer Data**: Sync customer info from CRM
- **Pipeline Tracking**: Update CRM status based on project progress

### With Calculator Module
- **Quote Generation**: Calculator results feed project estimates
- **Cost Tracking**: Compare estimated vs actual costs
- **Margin Analysis**: Real-time margin calculations

### With Documents Module
- **Contract Generation**: Auto-generate vendor SPKs
- **Invoice Creation**: Generate payment invoices
- **Progress Reports**: Document progress updates

### With Financial Reports
- **Cash Flow Reports**: Project-level cash flow analysis
- **Profitability**: Project margin tracking
- **Vendor Performance**: Payment timeliness metrics

## File Structure

```
src/
├── app/(protected)/projects/
│   ├── page.tsx                    # Projects list
│   ├── [id]/page.tsx               # Project detail (tabs)
│   └── new/page.tsx                # Create project
├── components/projects/
│   ├── ProjectCard.tsx             # Project summary card
│   ├── ProjectTabs.tsx             # Tab navigation
│   ├── VendorSPKTable.tsx          # Vendor contracts table
│   ├── ProgressTable.tsx           # Progress tracking
│   ├── PaymentTables.tsx           # Payment history
│   └── ProjectCharts.tsx           # Progress visualizations
├── hooks/
│   └── useProjects.ts              # Project CRUD hooks
└── lib/projects/
    ├── calculations.ts             # Business logic functions
    ├── validations.ts              # Form validations
    └── types.ts                    # TypeScript types
```

## Performance Considerations

### Query Optimization
- **Indexes**: Strategic indexes on FKs and date fields
- **Views**: Pre-calculated summary views
- **Caching**: React Query for data caching
- **Pagination**: Large datasets with pagination

### Calculation Efficiency
- **Server-side**: Complex calculations in database functions
- **Memoization**: React memo for expensive recalculations
- **Background Updates**: Non-blocking calculation updates

## Security & Permissions

### Access Control
- **Project Owners**: Full access to owned projects
- **Department Access**: Department-based project visibility
- **Vendor Access**: Future - read-only access for assigned vendors
- **Audit Logging**: All changes tracked

### Data Protection
- **File Security**: Signed URLs for attachments
- **Financial Data**: Encrypted sensitive payment info
- **Access Logs**: User access tracking
- **Backup**: Regular encrypted backups

## Future Roadmap

### Phase 2: Enhanced Features
- **Gantt Charts**: Visual project timeline
- **Resource Allocation**: Team member assignments
- **Risk Management**: Issue tracking and mitigation
- **Change Orders**: Contract amendment workflow
- **Mobile App**: Field progress updates

### Phase 3: Advanced Analytics
- **Predictive Analytics**: Project delay prediction
- **Benchmarking**: Industry comparison metrics
- **Automated Reporting**: Scheduled progress reports
- **Integration APIs**: Third-party tool integration

### Phase 4: Vendor Portal
- **Vendor Self-service**: Progress updates and document uploads
- **Automated Payments**: Integration with payment gateways
- **Performance Dashboard**: Vendor performance metrics
- **Contract Management**: Digital contract signing

---

*Last Updated: 2026-04-04*
*Status: MVP Implementation*