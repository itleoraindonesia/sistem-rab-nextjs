✅ PROMPT UTAMA (WAJIB – PASTE PERTAMA)
You are working on an existing Next.js App Router project.
Do NOT refactor or change existing architecture, patterns, or file structure.

Goal:
Extend the existing RAB form to support new fields that already exist in the database.

Constraints:

- Use existing API layer, hooks, and components.
- Use React Hook Form and Zod.
- Only ADD new fields and schemas, do not rename or remove existing ones.
- Keep backward compatibility with existing RAB data.
- Assume old schema already works.

New fields to add:

- location_provinsi (string)
- location_kabupaten (string)
- location_address (string | optional)
- client_profile (json object: nama, alamat, no_hp, email)
- project_profile (json object: kategori, deskripsi)
- estimasi_pengiriman (date)

Rules:

- client_profile and project_profile must stay as nested objects.
- Provinsi and kabupaten are stored as text (no FK).
- Validation must be done with Zod and wired to RHF.
- Do not touch snapshot logic.
- Do not modify existing submit handlers unless necessary.

Output:

- Only generate the minimal code needed.
- Follow existing naming conventions.
- No explanations, only code.

➕ PROMPT LANJUTAN: ZOD SAJA
Add Zod validation for the new RAB fields.
Merge it into the existing RabSchema without breaking existing fields.
Do not redefine the full schema, only extend it.

➕ PROMPT LANJUTAN: FORM FIELD SAJA
Add the following fields into the existing RAB form UI using React Hook Form:

- Client profile section (nama, alamat, no_hp, email)
- Project profile section (kategori select + deskripsi textarea)
- Location section (provinsi, kabupaten, address)
- Estimasi pengiriman (date input)

Use existing form components and styling.
Do not change layout structure.

➕ PROMPT LANJUTAN: DATA FETCH ONGKIR
Implement dependent dropdowns for provinsi and kabupaten.
Reuse existing fetch utilities if available.
Avoid introducing new state management libraries.

🧠 PROMPT ANTI-ERROR (OPSIONAL TAPI KUAT)
If something is missing, infer it from the existing codebase.
Do not ask questions.
Do not suggest refactors.
Assume database migration is already applied.
