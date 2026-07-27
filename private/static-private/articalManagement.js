async function loadImages() {

    try {

        const response = await fetch("/articles/alldata/50");
        const articles = await response.json();

        console.log(articles);

        const articleDiv = document.querySelector(".card-holder");

        articleDiv.innerHTML = "";

        articles.forEach(article => {

            const row = document.createElement("a");

            row.className = "card";

            row.style = `background-image: url(/image/uploads/image/${article.coverID});`

            row.href = `/articles/article/${article.articleID}`

            row.innerHTML = `
                            <p class="card-text">${article.title}</p>
                            <a href="/articles/areyousure/${article.articleID}" class="main">delete</a>
                            <br>
                            <a href="/articles/edit/${article.articleID}" class="main">edit</a>
            `;

            articleDiv.appendChild(row);

        });

    }
    catch (err) {

        console.error(err);

    }

}

loadImages();