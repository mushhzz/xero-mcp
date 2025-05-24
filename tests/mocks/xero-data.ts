// Mock Xero organisation data
export const mockOrganisation = {
  organisationID: "test-org-123",
  name: "Test Company Pty Ltd",
  legalName: "Test Company Proprietary Limited",
  countryCode: "AU",
  baseCurrency: "AUD",
  organisationEntityType: "COMPANY",
  taxNumber: "12345678901",
  registrationNumber: "123456789"
};

// Mock Xero accounts data
export const mockAccounts = [
  {
    accountID: "acc-001",
    code: "200",
    name: "Sales",
    type: "REVENUE",
    status: "ACTIVE",
    description: "Sales income",
    taxType: "OUTPUT2"
  },
  {
    accountID: "acc-002", 
    code: "400",
    name: "Advertising",
    type: "EXPENSE",
    status: "ACTIVE",
    description: "Advertising expenses",
    taxType: "INPUT2"
  },
  {
    accountID: "acc-003",
    code: "800",
    name: "Bank Account",
    type: "BANK",
    status: "ACTIVE",
    description: "Main bank account"
  }
];

// Mock Xero contacts data
export const mockContacts = [
  {
    contactID: "contact-001",
    name: "John Smith",
    emailAddress: "john@example.com",
    contactStatus: "ACTIVE",
    phones: [
      {
        phoneType: "MOBILE",
        phoneNumber: "0412345678"
      }
    ]
  },
  {
    contactID: "contact-002",
    name: "Acme Corporation",
    emailAddress: "accounts@acme.com", 
    contactStatus: "ACTIVE",
    phones: [
      {
        phoneType: "DEFAULT",
        phoneNumber: "0298765432"
      }
    ]
  }
];

// Mock invoice data
export const mockInvoices = [
  {
    invoiceID: "invoice-001",
    invoiceNumber: "INV-001",
    type: "ACCREC",
    status: "AUTHORISED",
    contact: mockContacts[0],
    dateString: "2024-01-15",
    dueDate: "2024-02-15",
    total: 1100.00,
    totalTax: 100.00,
    currencyCode: "AUD",
    lineItems: [
      {
        description: "Consulting Services",
        quantity: 10,
        unitAmount: 100.00,
        lineAmount: 1000.00,
        accountCode: "200",
        taxType: "OUTPUT2"
      }
    ]
  }
];

// Test data for creating new records
export const testNewContact = {
  name: "Test Customer",
  emailAddress: "test@example.com",
  phones: [
    {
      phoneType: "MOBILE",
      phoneNumber: "0400123456"
    }
  ]
};

export const testNewInvoice = {
  type: "ACCREC",
  contact: { contactID: "contact-001" },
  lineItems: [
    {
      description: "Test Service",
      quantity: 1,
      unitAmount: 250.00,
      accountCode: "200",
      taxType: "OUTPUT2"
    }
  ],
  dueDate: "2024-12-31"
};

// Mock responses structure
export const createMockResponse = <T>(data: T, error: string | null = null) => ({
  result: error ? null : data,
  error,
  isError: error !== null
}); 