async function loadPdfCards() {

    try {

        const response = await fetch("/documents/alldata/50");
        const pdfs = await response.json();

        pdfs.sort((a, b) => {
            return a.uploadDate.localeCompare(b.uploadDate);
        })

        const pdfDiv = document.querySelector(".card-holder");

        pdfDiv.innerHTML = "";

        pdfs.forEach(pdf => {

            const row = document.createElement("a");

            row.className = "card";

            row.style = `background-image: url(/image/uploads/image/${pdf.Cover.replaceAll(" ", "%20")});`
            row.href = `document/${pdf.id}`

            row.innerHTML = `
                            <p class="card-text">${pdf.documentName}</p>
            `;

            pdfDiv.appendChild(row);

        });

    }
    catch (err) {

        console.error(err);

    }

    

}

async function loadArticleLatest() {

    try {

        const response = await fetch("/articles/alldata/50");
        const articles = await response.json();

        articles.sort((a, b) => {
            return b.uploadDate.localeCompare(a.uploadDate);
        })

        const articleDiv = document.getElementById("article-holder");

        articleDiv.innerHTML = "";

        const article = articles[0];

        const row = document.createElement("a");

        row.className = "card";

        row.style = `background-image: url(/image/uploads/image/${article.coverID});`

        row.href = `article/${article.articleID}`

        row.innerHTML = `
                        <p class="card-text">${article.title}</p>
        `;

        articleDiv.appendChild(row);

        

    }
    catch (err) {

        console.error(err);

    }

}

loadArticleLatest();
loadPdfCards();