async function loadImages() {

    try {

        const response = await fetch("/articles/alldata/50");
        const articles = await response.json();

        articles.sort((a, b) => {
            return a.uploadDate.localeCompare(b.uploadDate);
        })

        console.log(articles);

        const articleDiv = document.querySelector(".card-holder");

        articleDiv.innerHTML = "";

        articles.forEach(article => {

            const row = document.createElement("a");

            row.className = "card";

            row.style = `background-image: url(/image/uploads/image/${article.coverID});`

            row.href = `article/${article.articleID}`

            row.innerHTML = `
                            <p class="card-text">${article.title}</p>
            `;

            articleDiv.appendChild(row);

        });

    }
    catch (err) {

        console.error(err);

    }

}

loadImages();