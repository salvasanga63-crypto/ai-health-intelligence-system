import Layout from '../components/Layout';

export default function SchemaPage() {
  return (
    <Layout title="Patient Database Schema">
      <section className="schema-page">
        <h2>Patient Database Schema</h2>
        <p>This schema describes the patient-focused entities used by the HealthIntelligencePlatform.</p>

        <article className="schema-section">
          <h3>Patients</h3>
          <table>
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>patient_id</td><td>UUID</td><td>Primary key, unique identifier</td></tr>
              <tr><td>first_name</td><td>text</td><td>Patient first name</td></tr>
              <tr><td>last_name</td><td>text</td><td>Patient last name</td></tr>
              <tr><td>date_of_birth</td><td>date</td><td>Date of birth</td></tr>
              <tr><td>gender</td><td>enum</td><td>Male, Female, Other</td></tr>
              <tr><td>contact_info</td><td>JSON</td><td>Phone, email, address</td></tr>
              <tr><td>emergency_contact</td><td>JSON</td><td>Name, relation, phone</td></tr>
              <tr><td>created_at</td><td>timestamp</td><td>Record creation timestamp</td></tr>
              <tr><td>updated_at</td><td>timestamp</td><td>Record update timestamp</td></tr>
            </tbody>
          </table>
        </article>

        <article className="schema-section">
          <h3>Medical_History</h3>
          <table>
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>history_id</td><td>UUID</td><td>Primary key</td></tr>
              <tr><td>patient_id</td><td>UUID</td><td>Foreign key → Patients.patient_id</td></tr>
              <tr><td>condition</td><td>text</td><td>Condition name</td></tr>
              <tr><td>diagnosis_date</td><td>date</td><td>Diagnosis date</td></tr>
              <tr><td>status</td><td>enum</td><td>active, resolved</td></tr>
              <tr><td>notes</td><td>text</td><td>Clinical notes</td></tr>
            </tbody>
          </table>
        </article>

        <article className="schema-section">
          <h3>Visits</h3>
          <table>
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>visit_id</td><td>UUID</td><td>Primary key</td></tr>
              <tr><td>patient_id</td><td>UUID</td><td>Foreign key → Patients.patient_id</td></tr>
              <tr><td>visit_date</td><td>timestamp</td><td>Visit timestamp</td></tr>
              <tr><td>reason</td><td>text</td><td>Reason for visit</td></tr>
              <tr><td>triage_score</td><td>integer</td><td>AI prediction score</td></tr>
              <tr><td>doctor_id</td><td>UUID</td><td>Foreign key → Users.user_id</td></tr>
              <tr><td>notes</td><td>text</td><td>Visit notes</td></tr>
            </tbody>
          </table>
        </article>

        <article className="schema-section">
          <h3>Lab_Results</h3>
          <table>
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>lab_id</td><td>UUID</td><td>Primary key</td></tr>
              <tr><td>patient_id</td><td>UUID</td><td>Foreign key → Patients.patient_id</td></tr>
              <tr><td>test_type</td><td>text</td><td>Test type</td></tr>
              <tr><td>result</td><td>JSON</td><td>Structured lab values</td></tr>
              <tr><td>uploaded_by</td><td>UUID</td><td>Foreign key → Users.user_id</td></tr>
              <tr><td>uploaded_at</td><td>timestamp</td><td>Upload timestamp</td></tr>
            </tbody>
          </table>
        </article>

        <article className="schema-section">
          <h3>Prescriptions</h3>
          <table>
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>prescription_id</td><td>UUID</td><td>Primary key</td></tr>
              <tr><td>patient_id</td><td>UUID</td><td>Foreign key → Patients.patient_id</td></tr>
              <tr><td>drug_name</td><td>text</td><td>Medication name</td></tr>
              <tr><td>dosage</td><td>text</td><td>Dosage instructions</td></tr>
              <tr><td>frequency</td><td>text</td><td>Administration frequency</td></tr>
              <tr><td>start_date</td><td>date</td><td>Prescription start date</td></tr>
              <tr><td>end_date</td><td>date</td><td>Prescription end date</td></tr>
              <tr><td>prescribed_by</td><td>UUID</td><td>Foreign key → Users.user_id</td></tr>
            </tbody>
          </table>
        </article>

        <article className="schema-section">
          <h3>Nutrition_Assessments</h3>
          <table>
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>assessment_id</td><td>UUID</td><td>Primary key</td></tr>
              <tr><td>patient_id</td><td>UUID</td><td>Foreign key → Patients.patient_id</td></tr>
              <tr><td>assessment_date</td><td>timestamp</td><td>Assessment timestamp</td></tr>
              <tr><td>diet_summary</td><td>text</td><td>Diet summary</td></tr>
              <tr><td>risk_score</td><td>integer</td><td>AI prediction score</td></tr>
              <tr><td>recommendations</td><td>text</td><td>Dietary recommendations</td></tr>
            </tbody>
          </table>
        </article>

        <article className="schema-section">
          <h3>Pregnancy_Risk</h3>
          <table>
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>risk_id</td><td>UUID</td><td>Primary key</td></tr>
              <tr><td>patient_id</td><td>UUID</td><td>Foreign key → Patients.patient_id</td></tr>
              <tr><td>assessment_date</td><td>timestamp</td><td>Assessment timestamp</td></tr>
              <tr><td>risk_level</td><td>enum</td><td>low, medium, high</td></tr>
              <tr><td>notes</td><td>text</td><td>Clinical notes</td></tr>
            </tbody>
          </table>
        </article>

        <article className="schema-section">
          <h3>Users</h3>
          <table>
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>user_id</td><td>UUID</td><td>Primary key</td></tr>
              <tr><td>name</td><td>text</td><td>User name</td></tr>
              <tr><td>role</td><td>enum</td><td>doctor, nurse, admin</td></tr>
              <tr><td>email</td><td>text</td><td>User email</td></tr>
              <tr><td>password_hash</td><td>text</td><td>Secure password hash</td></tr>
              <tr><td>created_at</td><td>timestamp</td><td>Record creation timestamp</td></tr>
            </tbody>
          </table>
        </article>
      </section>
    </Layout>
  );
}
