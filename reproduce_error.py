import requests
import io
from pypdf import PdfWriter

def create_dummy_pdf():
    pdf_writer = PdfWriter()
    page = pdf_writer.add_blank_page(width=72, height=72)
    output = io.BytesIO()
    pdf_writer.write(output)
    output.seek(0)
    return output

def test_ats():
    url = "http://localhost:8000/ats/evaluate"
    pdf_file = create_dummy_pdf()
    files = {'resume': ('test.pdf', pdf_file, 'application/pdf')}
    data = {'job_description': 'Software Engineer with Python skills.'}
    
    try:
        response = requests.post(url, files=files, data=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_ats()
