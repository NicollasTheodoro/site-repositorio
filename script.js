function mudarTexto(texto){


    if (texto === "h") {

        document.getElementById("card1").style.backgroundColor = "transparent";

        document.getElementById("titulo").textContent = "Hard Skills";

        document.getElementById("item1").textContent = "HTML";
        document.getElementById("item2").textContent = "CSS";
        document.getElementById("item3").textContent = "JavaScript";
        document.getElementById("item4").textContent = "PHP";
        document.getElementById("item5").textContent = "Python";
        document.getElementById("item6").textContent = "SQL/MySQL e PostGree";
        document.getElementById("item7").textContent = "Git/GitHub";

        document.getElementById("cardTitle1").textContent = "";
        document.getElementById("cardText1").textContent = "";
    } else if (texto === "s") {

        document.getElementById("card1").style.backgroundColor = "transparent";

         document.getElementById("titulo").textContent = "Soft Skill";

        document.getElementById("item1").textContent = "Comunicação";
        document.getElementById("item2").textContent = "Trabalho em equipe";
        document.getElementById("item3").textContent = "Resolução de problemas";
        document.getElementById("item4").textContent = "Aprendizado contínuo";
        document.getElementById("item5").textContent = "Organização";

        document.getElementById("cardTitle1").textContent = "";
        document.getElementById("cardText1").textContent = "";
        
    } else if (texto === "x") {


        document.getElementById("card1").style.backgroundColor = "#181818";
        document.getElementById("titulo").textContent = "Experiências";

        document.getElementById("item1").textContent = "";
        document.getElementById("item2").textContent = "";
        document.getElementById("item3").textContent = "";
        document.getElementById("item4").textContent = "";
        document.getElementById("item5").textContent = "";
        document.getElementById("item6").textContent = "";
        document.getElementById("item7").textContent = "";
        
        document.getElementById("cardTitle1").textContent = "Sistema Web Educacional (Líder de Equipe)";
        document.getElementById("cardText1").textContent = "Fui responsável por gerir uma equipe de 5 pessoas em um sistema educacional que visava o auxílio no estudo espaçado e distribuição de conteúdo para os alunos da rede FAETEC de Jardim América.";
        
        

        
    } else {
         document.getElementById("titulo").textContent = "Hard Skills";

    }
    

}

function alternarTema() {
    document.body.classList.toggle("light-mode");
    document.getElementsByTagName("footer").toggle("light-mode");
}