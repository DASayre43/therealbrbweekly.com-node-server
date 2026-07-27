async function loadImages() {

    try {

        const response = await fetch("/image/alldata/50");
        const images = await response.json();

        console.log(images);

        const imageDiv = document.querySelector(".card-holder");

        imageDiv.innerHTML = "";

        images.forEach(image => {

            const row = document.createElement("a");

            row.className = "card";

            row.style = `background-image: url(/image/uploads/image/${image.id});`

            row.href = `/image/uploads/image/${image.id}`

            // row.innerHTML = `
            //     <img id="card-img" src="/image/uploads/image/${image.id}" width="200">
            //     <br>
            //     <strong id="card-tx">${image.caption}</strong>
            //     <br>
            //     <a id="b1" href="/image/uploads/image/${image.id}">
            //         View
            //     </a>
            //     <a id="b2" href="/image/uploads/image/${image.id}">
            //         View
            //     </a>
            //     <a id="b3" href="/image/uploads/image/${image.id}">
            //         View
            //     </a>
            // `;
            row.innerHTML = `
                            <p class="card-text">${image.caption}</p>
                            <a href="/image/areyousure/${image.id}" class="main">delete</a>
            `;

            imageDiv.appendChild(row);

        });

    }
    catch (err) {

        console.error(err);

    }

}

loadImages();