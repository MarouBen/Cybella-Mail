// This file contains the javascript code for the inbox page

document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_mail);
  
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#emails-section').style.display = 'none';
  document.querySelector('#Title').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#title-change').innerHTML = `<h3>Compose Email</h3>`;
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#emails-section').style.display = 'block';
  document.querySelector('#Title').style.display = 'block';
  // Show the mailbox name
  document.querySelector('#title-change').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Container for the emails
  const tableBody = document.querySelector('#emails-view');

  // Load the emails
  if (mailbox === 'inbox'){
    setTimeout(function() {load_inbox(tableBody);}, 10);
  }
  if (mailbox === 'archive'){
    setTimeout(function() {load_archive(tableBody);}, 10);
  }
  if (mailbox === 'sent'){
    setTimeout(function() {load_sent(tableBody);}, 10);
  }
}

// load inbox emails
function load_inbox(list){
  fetch('/emails/inbox')
  .then(response => response.json())
  .then(emails => {
      // Show the emails
      show_emails(emails, list);
      });
  }

// load archive emails
function load_archive(list){
  fetch('/emails/archive')
  .then(response => response.json())
  .then(emails => {
      // show the emails
      show_emails(emails, list)
      });
  }

//load sent emails
function load_sent(list){
  fetch('/emails/sent')
  .then(response => response.json())
  .then(emails => {
      // show the emails
      show_emails(emails, list)
      });
  }

// function to view email
function view_email(id){
  document.querySelector('#emails-section').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#Title').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Show the email data
      document.querySelector('#email-subject').innerHTML = email.subject;
      document.querySelector('#email-sender').innerHTML = email.sender;
      document.querySelector('#time').innerHTML = email.timestamp;
      document.querySelector('#email-body').innerHTML = email.body;
      // archive button and unarchive button
      if (email.archived === true){
        document.querySelector("#archive_Icon").classList.add("text-rose-500");
      } else {
        document.querySelector("#archive_Icon").classList.remove("text-rose-500");
      }
      // mark email as read
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })
      // add event listener to buttons
      //// Archive Icon
      document.querySelector("#archive_Icon").addEventListener('click', () => {
        if (email.archived === false){
          archive_email(email.id, "archive");
        }
        else if (email.archived === true){
          archive_email(email.id, "unarchive");
        }
      });
      //// Reply button
      document.querySelectorAll("#reply_btn,#reply").forEach((element)=>{
        element.addEventListener('click', () => {
        reply_email(email.id);
        });
      });
      //// Forward button
      document.querySelectorAll("#forward_btn,#forward").forEach((element)=>{
        element.addEventListener('click', () => {
        forward_email(email.id);
        });
      });
      //// Delete button
      document.querySelector("#delete").addEventListener('click', () => {
        delete_email(email.id);
      });
  });
}


// function to archive email
function archive_email(id,action){
  if (action === "archive"){
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: true
      })
    })
  }
  else if (action === "unarchive"){
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: false
      })
    })
  }
  setTimeout(function() {load_mailbox('inbox');}, 10);
}

// function to reply email
function reply_email(id){
  compose_email();
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Show the email data
      document.querySelector('#compose-recipients').value = email.sender;
      document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
      document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}
      \n ------------------------------------------------------\n`;
  });
}

// function to forward email
function forward_email(id){
  compose_email();
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Show the email data
      document.querySelector('#compose-recipients').value = "";
      document.querySelector('#compose-subject').value = `Forwarded: ${email.subject}`;
      document.querySelector('#compose-body').value = email.body;
  });
}

// function to send email
function send_mail(){
  event.preventDefault()
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      alert(result.message);
  });
  setTimeout(function() {load_mailbox('sent');}, 10);
}


// function to show emails in a table format
function show_emails(emails, tableBody){
  // clear the table
  tableBody.innerHTML = '';

  emails.forEach(email => {
    // create a row for each email
    const element = document.createElement('tr');
    element.className = "border-b hover:bg-gray-50 cursor-pointer hover:shadow-lg border-gray-400"; 

    // add a checkbox
    const checkbox = document.createElement('input');
    checkbox.className = "w-4 h-4 text-sky-700 rounded bg-gray-100 border-gray-500";
    checkbox.type = "checkbox";

    const checkkboxtd = document.createElement('td');
    checkkboxtd.className = "p-4 w-1 leading-3";
    checkkboxtd.append(checkbox);
    element.append(checkkboxtd);
    

    // data for the row
    const sender = document.createElement('td');
    sender.className = "p-2";
    sender.innerHTML = email.sender;

    const subject = document.createElement('td');
    subject.className = "p-2";
    subject.innerHTML = email.subject;

    const timestamp = document.createElement('td');
    timestamp.className = "p-2 text-right";
    timestamp.innerHTML = email.timestamp;

    const id = document.createElement('td');
    id.className = "hidden";
    id.value = email.id;

    // append data to the row
    element.append(sender);
    element.append(subject);
    element.append(timestamp);
    element.append(id);

    // append row to the table
    tableBody.append(element);
    // check if email is read
    if (email.read === true){
      element.classList.add("bg-gray-200");
    }
    // add event listener to the email
    element.addEventListener('click', () => view_email(email.id));
     // add event listener to checkbox
     checkbox.addEventListener('click', (event) => {
      // prevent click event from propagating to row element
      event.stopPropagation();
    });
  });
}

//function to delete email
function delete_email(id){
  fetch(`/emails/delete/${id}`, {
    method: 'DELETE',
  })
  setTimeout(function() {load_mailbox('inbox');}, 10);
}

// function to refresh the section
function refresh(){
  var location = document.querySelector("TITLE").innerHTML;
  if (location === "Inbox"){
    load_mailbox('inbox');
  }
  else if (location === "Sent"){
    load_mailbox('sent');
  }
  else if (location === "Archive"){
    load_mailbox('archive');
  }
}

// function to select all
function select_all() {
  var selectAllCheckbox = document.querySelector('#select_all');
  var checkboxes = document.querySelectorAll('input[type=checkbox]');

  selectAllCheckbox.addEventListener('change', () => {
    checkboxes.forEach((checkbox) => {
      checkbox.checked = selectAllCheckbox.checked;
    });
  });

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      if (!checkbox.checked) {
        selectAllCheckbox.checked = false;
      } else {
        var allChecked = true;
        checkboxes.forEach((cb) => {
          if (!cb.checked) {
            allChecked = false;
          }
        });
        selectAllCheckbox.checked = allChecked;
      }
    });
  });
}


//function that deletes all selected emails
function delete_selected(){
  var checkboxes = document.querySelectorAll('input[type=checkbox]');
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked){
      var id = checkbox.parentElement.parentElement.lastElementChild.value;
      delete_email(id);
    }
  });
}

//function that search for emails
function searching(event) {
  if (event.keyCode === 13) {
    event.preventDefault(); // prevent form from submitting
    var searchValue = document.querySelector("#search").value;
    fetch(`/emails/search/${searchValue}`,{method: 'GET',})
    .then(response => response.json())
    .then(emails => {
      // Show the emails
      const tableBody = document.querySelector('#emails-view');
      document.querySelector('#title-change').innerHTML = `<h3>Searching all emails containing:<span class="text-sky-700"> ${searchValue}</span></h3>`;
      show_emails(emails, tableBody);
    });
  }
}

// function that shows the sidebar
function showSidebar() {
  document.querySelectorAll(".menu-element").forEach(element => {
      element.classList.toggle('hidden');
  });
  document.querySelector("#logo").classList.toggle('hidden');
  document.querySelector(".sidebar").classList.remove('w-[60px]');
  document.querySelector(".sidebar").classList.add('w-[300px]');
  document.querySelector(".menu").classList.add('hidden');
  document.querySelector("#currentUser").classList.remove('hidden'); 
  document.querySelector("#currentUser").classList.add('inline');       
}

// function that hides the sidebar
function hideSidebar() {
  document.querySelectorAll(".menu-element").forEach(element => {
      element.classList.toggle('hidden');
  });
  document.querySelector("#logo").classList.toggle('hidden');
  document.querySelector(".sidebar").classList.remove('w-[300px]');
  document.querySelector(".sidebar").classList.add('w-[60px]');
  document.querySelector(".menu").classList.remove('hidden');
  document.querySelector("#currentUser").classList.add('hidden'); 
  document.querySelector("#currentUser").classList.remove('inline py-2'); 
}