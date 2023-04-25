# Cybella Mail
#### Video Demo:  <[URL HERE](https://youtu.be/1KHg-fMhzFQ)>
This is a single-page application email client built with Django, JavaScript, HTML, and CSS. It allows users to send and receive emails, as well as archive, unarchive, and reply to emails.

## Installation and Setup
1. Clone the repository: `git clone https://github.com/MarouBen/Cybella-Mail.git`
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment: `source venv/bin/activate` (on Mac/Linux) or `venv\Scripts\activate` (on Windows)
4. Install the dependencies: `pip install -r requirements.txt`
5. Apply the migrations: `python manage.py migrate`
6. Start the server: `python manage.py runserver`

## Usage
1. Navigate to `http://localhost:8000` in your web browser.
2. You will see a login page where you can enter your credentials or create a new account if you don't have one.
3. Once logged in, you will see your inbox with a list of emails.
4. You can click on an email to view its content, reply to it, or archive/unarchive it.
5. You can also compose a new email by clicking the "Compose" button at the top of the page.

## API Documentation
The application uses the following API endpoints:

* POST `/emails`: Sends an email with the given recipients, subject, and body.
* GET `/emails/<mailbox>`: Returns a list of emails in the specified mailbox (inbox, sent, or archive).
* GET `/emails/<email_id>`: Returns the content of the specified email.
* PUT `/emails/<email_id>`: Updates the specified email's read/unread status or archived/unarchived status.

## Credits
This project was created by Marouane BEN ABBOU. It uses the following open-source libraries:

* Django
* JavaScript
* HTML
* CSS
* Tailwind CSS

## License
This project is licensed under the MIT License - see the LICENSE file for details.
