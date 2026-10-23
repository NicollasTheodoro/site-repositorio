// Teste para marcar corrida no WhatsApp (movido do antigo script.js)
const form = document.getElementById("formCorrida");

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const endereco = document.getElementById("endereco").value;
    const horario = document.getElementById("horario").value;

    const numeroWhatsApp = "5521979903028";

    const mensagem = `Olá! Gostaria de marcar uma corrida.

📍 Endereço: ${endereco}
🕐 Horário: ${horario}`;

    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;

    window.open(url, "_blank");
});
