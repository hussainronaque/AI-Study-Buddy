function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  // Store user info in session if needed
  sessionStorage.setItem('userEmail', profile.getEmail());
  sessionStorage.setItem('userName', profile.getName());
  // Redirect to dashboard
  window.location.href = '/dashboard/dashboard.html';
}

function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    sessionStorage.clear();
    window.location.href = '/index.html';
  });
}

function handleEmailSignup(event) {
    event.preventDefault();
    
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    // Here you would typically make an API call to your backend
    // For now, we'll just log the values and redirect
    console.log('Email:', email);
    console.log('Password:', password);
    
    // TODO: Add your signup logic here
    // For example:
    // await createUserWithEmailAndPassword(auth, email, password);
    
    // Redirect to dashboard (remove this when you add actual authentication)
    window.location = "dashboard/dashboard.html";
    
    return false;
}