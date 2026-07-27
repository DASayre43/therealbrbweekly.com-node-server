async function loadImages() {

    try {

        const response = await fetch("/documents/alldata/50");
        const pdfs = await response.json();

        console.log(pdfs);

        const documentDiv = document.querySelector(".card-holder");

        documentDiv.innerHTML = "";

        pdfs.forEach(pdf => {

            const row = document.createElement("a");

            row.className = "card";

            row.style = `background-image: url(/image/uploads/image/${pdf.Cover});`

            row.href = `/documents/document/${pdf.id}`

            row.innerHTML = `
                            <p class="card-text">${pdf.documentName}</p>
                            <a href="/documents/areyousure/${pdf.id}" class="main">delete</a>
            `;

            documentDiv.appendChild(row);

        });

    }
    catch (err) {

        console.error(err);

    }

}

loadImages();