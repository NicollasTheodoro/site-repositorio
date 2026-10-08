const corCartao = "#460259";

function mudarTexto(texto) {

    if (texto === "h") {

        document.getElementById("card1").style.backgroundColor = "transparent";
        document.getElementById("card2").style.backgroundColor = "transparent";

        document.getElementById("titulo").textContent = "Hard Skills";

        document.getElementById("item1").textContent = "HTML";
        document.getElementById("item2").textContent = "CSS";
        document.getElementById("item3").textContent = "JavaScript";
        document.getElementById("item4").textContent = "PHP";
        document.getElementById("item5").textContent = "Python";
        document.getElementById("item6").textContent = "SQL/MySQL e PostGree";
        document.getElementById("item7").textContent = "Git/GitHub";

        document.getElementById("card-title1").textContent = "";
        document.getElementById("card-text1").textContent = "";

        document.getElementById("card-title2").textContent = "";
        document.getElementById("card-text2").textContent = "";

    } else if (texto === "s") {

        document.getElementById("card1").style.backgroundColor = "transparent";
        document.getElementById("card2").style.backgroundColor = "transparent";

        document.getElementById("titulo").textContent = "Soft Skill";

        document.getElementById("item1").textContent = "Comunicação";
        document.getElementById("item2").textContent = "Trabalho em equipe";
        document.getElementById("item3").textContent = "Resolução de problemas";
        document.getElementById("item4").textContent = "Aprendizado contínuo";
        document.getElementById("item5").textContent = "Organização";
        document.getElementById("item6").textContent = "";
        document.getElementById("item7").textContent = "";

        document.getElementById("card-title1").textContent = "";
        document.getElementById("card-text1").textContent = "";

        document.getElementById("card-title2").textContent = "";
        document.getElementById("card-text2").textContent = "";

    } else if (texto === "x") {


        document.getElementById("card1").style.backgroundColor = corCartao;
        document.getElementById("card2").style.backgroundColor = corCartao;
        document.getElementById("titulo").textContent = "Experiências";

        document.getElementById("item1").textContent = "";
        document.getElementById("item2").textContent = "";
        document.getElementById("item3").textContent = "";
        document.getElementById("item4").textContent = "";
        document.getElementById("item5").textContent = "";
        document.getElementById("item6").textContent = "";
        document.getElementById("item7").textContent = "";

        document.getElementById("card-title1").textContent = "Sistema Web Educacional (Líder de Equipe)";
        document.getElementById("card-text1").textContent = "Fui responsável por gerir uma equipe de 5 pessoas em um sistema educacional que visava o auxílio no estudo espaçado e distribuição de conteúdo para os alunos da rede FAETEC de Jardim América.";

        document.getElementById("card-title2").textContent = "Sistema Web Educacional (Líder de Equipe)";
        document.getElementById("card-text2").textContent = "Isso é apenas um teste";




    } else {
        document.getElementById("titulo").textContent = "Hard Skills";

    }


}

function alternarTema() {
    document.body.classList.toggle("light-mode");
}

function mudarTextoFormacao(texto) {

    if (texto === "con") {

        document.getElementById("certificado1").style.display = "inline";

        document.getElementById("card-formacao1").style.backgroundColor = corCartao;
                document.getElementById("card-formacao2").style.backgroundColor = corCartao;


        document.getElementById("titulo-formacoes").textContent = "Concluídos";

        document.getElementById("card-formacao-title1").textContent = "Concluí o curso médio/técnico em informática";

        document.getElementById("card-formacao-text1").textContent = "Curso realizado de 10/05/2024 à 24/05/2025";


        document.getElementById("card-formacao-title2").textContent = "Concluí o curso técnico de instrutor pela instituição preparatória FUSAO";
        document.getElementById("card-formacao-text2").textContent = "Curso realizado de 22/05/2022 à 20/05/2024";
        


    } else if (texto === "cur") {
        document.getElementById("certificado1").style.display = "none";
        document.getElementById("certificado2").style.display = "none";

        document.getElementById("card-formacao1").style.backgroundColor = corCartao;
                document.getElementById("card-formacao2").style.backgroundColor = corCartao;

        document.getElementById("titulo-formacoes").textContent = "Cursando";

        document.getElementById("card-formacao-title1").textContent = "Estou atualmente cursando Ferramentas WEB, com previsão de conclusão para 10/10/2037";

        document.getElementById("card-formacao-text1").textContent = "Início: 22/03/2026 | Previsão de término 10/02/2027";


        document.getElementById("card-formacao-title2").textContent = "Estou atualmente cursando Design — pela Instituição de Design Brasileira";

        
        document.getElementById("card-formacao-text2").textContent = "Início: 20/07/2025 | Previsão de conclusão para 13/11/2026";

        

    } else {
        document.getElementById("card-formacao1").style.backgroundColor = corCartao;
        
        document.getElementById("card-formacao2").style.backgroundColor = corCartao;

        document.getElementById("titulo-formacoes").textContent = "Concluídos";

        document.getElementById("card-formacao-title1").textContent = "Concluí o curso médio/técnico em informática";

        document.getElementById("card-formacao-title2").textContent = "Concluí o curso técnico de instrutor pela instituição preparatória FUSAO";

    }
}

function alternarTema() {

    document.body.classList.toggle("light-mode");

    const lua = document.getElementById("lua");
    const sol = document.getElementById("sol");

    if (document.body.classList.contains("light-mode")) {

        lua.style.display = "none";
        sol.style.display = "inline";
        // sol.style.color = "#FFD43B";

    } else {

        lua.style.display = "inline";
        sol.style.display = "none";
        lua.style.color = "white";
    }
}


// Teste para marcar corrida no whatsapp

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