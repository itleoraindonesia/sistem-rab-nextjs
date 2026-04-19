# Vendor Module (Planned)

## Overview
Modul untuk mengelola hubungan dengan vendor/supplier dan subcontractor. Sistem ini akan memungkinkan vendor untuk login langsung ke portal khusus dan mengakses informasi yang relevan dengan kontrak mereka.

## Planned Features

### Vendor Portal
- **Self-registration**: Vendor bisa register sendiri
- **Document access**: Akses SPK, PO, invoice yang terkait
- **Progress reporting**: Update progress pekerjaan real-time
- **Invoice submission**: Submit invoice untuk pembayaran
- **Payment tracking**: Monitoring status pembayaran

### Subcontractor Management
- **SPK Management**: Kontrak dengan subcontractor
- **Progress Monitoring**: Track pekerjaan subcontractor
- **Quality Control**: QC reports dan approval
- **Payment Terms**: Termin pembayaran berdasarkan progress

### Vendor Performance
- **Rating System**: Performance rating vendor
- **Delivery Time**: On-time delivery tracking
- **Quality Score**: Quality assessment
- **Cost Efficiency**: Budget vs actual cost analysis

## Database Schema (Planned)

### vendors
```sql
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_perusahaan VARCHAR(255) NOT NULL,
  jenis_vendor VARCHAR(50) CHECK (jenis_vendor IN ('supplier', 'subcontractor', 'consultant')),
  kategori_produk TEXT[], -- Array of product categories
  contact_person VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  alamat TEXT,
  npwp VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blacklisted')),

  -- Performance metrics
  rating DECIMAL(3,2), -- 1.00 - 5.00
  total_projects INTEGER DEFAULT 0,
  on_time_delivery_rate DECIMAL(5,2), -- percentage

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### vendor_users
```sql
CREATE TABLE vendor_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  nama VARCHAR(100) NOT NULL,
  jabatan VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  is_primary BOOLEAN DEFAULT false, -- Primary contact
  permissions TEXT[], -- Array of permissions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### vendor_spk (extends current table)
```sql
ALTER TABLE vendor_spk ADD COLUMN vendor_id UUID REFERENCES vendors(id);
```

## Integration Points

### With Project Tracking
- **SPK Assignment**: Link vendor ke project SPK
- **Progress Sync**: Vendor portal updates sync dengan project tracking
- **Payment Integration**: Vendor invoices flow ke payment system

### With Document Workflow
- **Contract Documents**: SPK generation dari templates
- **Amendment Workflow**: Perubahan kontrak approval
- **Termination Process**: Contract termination workflow

### With CRM
- **Vendor as Lead Source**: Vendor recommendations
- **Referral Program**: Incentive untuk vendor yang bring new business

## Security Model

### RBAC for Vendor Users
- **vendor_admin**: Full access vendor portal
- **project_manager**: Project-specific access
- **finance**: Invoice & payment access only
- **field_staff**: Progress update only

### Data Isolation
- **RLS Policies**: Vendor hanya akses data mereka sendiri
- **Project-based**: Access berdasarkan assigned projects
- **Document Security**: Encrypted sensitive documents

## Development Roadmap

### Phase 1: Foundation (Q2 2026)
- Vendor registration system
- Basic vendor portal
- SPK management integration

### Phase 2: Advanced Features (Q3 2026)
- Performance tracking
- Mobile app for field staff
- Advanced reporting

### Phase 3: Ecosystem (Q4 2026)
- Vendor marketplace
- Automated procurement
- AI-powered vendor matching

## Dependencies
- Current project tracking module
- Document workflow system
- Payment processing system
- Email notification system

## Success Metrics
- **Vendor Adoption**: % vendor yang aktif menggunakan portal
- **Process Efficiency**: Time reduction dalam vendor communication
- **Cost Savings**: Reduction dalam administrative overhead
- **Vendor Satisfaction**: Survey-based satisfaction scores

---

*Status: Planned*
*Estimated Timeline: Q2-Q4 2026*
*Priority: Medium*