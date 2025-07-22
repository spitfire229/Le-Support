document.getElementById("emailForm").addEventListener("submit", function(event) {
    event.preventDefault();
    let formData = new FormData(this);
    formData.append("destinataire", "lesuppetudiant@gmail.com");
    sendEmail(formData);
  });

  function sendEmail(formData) {
    let dest = formData.get("destinataire");
    let subject = encodeURIComponent(formData.get("objet"));
    let body = encodeURIComponent(formData.get("message") + "\n\nNom: " + formData.get("nom") + "\n\n");

    // Ajouter le lien de téléchargement de la pièce jointe dans le corps de l'e-mail
    let attachmentLink = encodeURIComponent(formData.get("pieceJointe"));
    body += "Télécharger la pièce jointe : " + attachmentLink;

    let mailtoLink = "mailto:" + dest + "?subject=" + subject + "&body=" + body;

    // Ouvrir le client de messagerie de l'utilisateur
    window.location.href = mailtoLink;
  }