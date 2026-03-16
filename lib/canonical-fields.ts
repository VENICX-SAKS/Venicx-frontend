export const CANONICAL_FIELDS = [
  { value: "[ignore]", label: "— Ignore this column —" },
  { value: "first_name", label: "First Name" },
  { value: "last_name", label: "Last Name" },
  { value: "date_of_birth", label: "Date of Birth" },
  { value: "gender", label: "Gender" },
  { value: "msisdn", label: "Phone Number (MSISDN)" },
  { value: "email", label: "Email Address" },
  { value: "national_id", label: "National ID" },
  { value: "address_line_1", label: "Address Line 1" },
  { value: "address_line_2", label: "Address Line 2" },
  { value: "city", label: "City" },
  { value: "province", label: "Province" },
  { value: "postal_code", label: "Postal Code" },
  { value: "consent_sms", label: "SMS Consent" },
  { value: "consent_email", label: "Email Consent" },
];

export const IDENTITY_FIELDS = ["msisdn", "email", "national_id"];
export const REQUIRED_FIELD_NOTE =
  "At least one of: Phone, Email, or National ID must be mapped.";
