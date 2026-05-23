/* global Swal */
// Array of products
const products = JSON.parse(localStorage.getItem("products")) || [];

let productName = document.getElementById("name");
let productId = document.getElementById("id");
let productPrice = document.getElementById("price");
let productTaxes = document.getElementById("taxes");
let productAds = document.getElementById("ads");
let productDiscount = document.getElementById("discount");
let productCount = document.getElementById("count");
let productCategory = document.getElementById("category");
let total = document.getElementById("total");

let editingProductIndex = null;

// Get Total
function getTotal(price, taxes, ads, discount) {
    return price + taxes + ads - discount;
}

// Update Total
function updateTotal() {
    let price = Number(productPrice.value) || 0;
    let taxes = Number(productTaxes.value) || 0;
    let ads = Number(productAds.value) || 0;
    let discount = Number(productDiscount.value) || 0;

    if (price !== 0) {
        let totalPrice = getTotal(price, taxes, ads, discount);
        total.textContent = `Total: $${totalPrice}`;
        total.style.background = "green";
    } else {
        total.textContent = "Total: $0";
        total.style.background = "#a00d02";
    }
}

productPrice.addEventListener("input", updateTotal);
productTaxes.addEventListener("input", updateTotal);
productAds.addEventListener("input", updateTotal);
productDiscount.addEventListener("input", updateTotal);

// Clean Data Inputs
function clearInputs() {
    productId.value = "";
    productName.value = "";
    productPrice.value = "";
    productTaxes.value = "";
    productAds.value = "";
    productDiscount.value = "";
    productCount.value = "";
    productCategory.value = "";
}

// Save In Local Storage
function saveInLocalStorage() {
    localStorage.setItem("products", JSON.stringify(products));
}

// Read Products
let productsTableBody = document.querySelector("tbody");

function displayProducts(products) {
    let row = "";
    products.forEach((product, index) => {
        row += `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>$${product.price}</td>
                <td>$${product.taxes}</td>
                <td>$${product.ads}</td>
                <td>$${product.discount}</td>
                <td>$${getTotal(product.price, product.taxes, product.ads, product.discount) * product.count}</td>
                <td>${product.category}</td>
                <td>${product.count}</td>
                <td><button class="update-btn" data-index="${index}">Update</button></td>
                <td><button class="reduce-btn" data-index="${index}">Reduce</button></td>
                <td><button class="delete-btn" data-index="${index}">Delete</button></td>
            </tr>
        `;
    });
    productsTableBody.innerHTML = row;
}
displayProducts(products);

function refreshUI() {
    saveInLocalStorage();
    displayProducts(products);
}

// Search Products
let searchInput = document.getElementById("search");
let searchMode = "name";

function searchProducts(searchTerm, searchBy) {
    let filteredProducts = products.filter((product) => {
        return product[searchBy].toString().toLowerCase().includes(searchTerm);
    });
    displayProducts(filteredProducts);
}

searchInput.addEventListener("input", () => {
    let term = searchInput.value.toLowerCase();
    searchProducts(term, searchMode);
});

let searchByIdBtn = document.getElementById("search-id");
let searchByNameBtn = document.getElementById("search-name");
let searchByCategoryBtn = document.getElementById("search-category");

searchByIdBtn.addEventListener("click", () => {
    searchInput.placeholder = "Search By ID";
    searchMode = "id";
});
searchByNameBtn.addEventListener("click", () => {
    searchInput.placeholder = "Search By Name";
    searchMode = "name";
});
searchByCategoryBtn.addEventListener("click", () => {
    searchInput.placeholder = "Search By Category";
    searchMode = "category";
});

// Update Products
let submitBtn = document.getElementById("submit-btn");
productsTableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("update-btn")) {
        let index = e.target.getAttribute("data-index");

        productId.value = products[index].id;
        productName.value = products[index].name;
        productPrice.value = products[index].price;
        productTaxes.value = products[index].taxes;
        productAds.value = products[index].ads;
        productDiscount.value = products[index].discount;
        productCount.value = products[index].count;
        productCategory.value = products[index].category;

        editingProductIndex = index;

        submitBtn.textContent = "Update Product";
    }
});

// Create and Update Products
submitBtn.addEventListener("click", () => {
    if (!productId.value || !productName.value || !productPrice.value || !productCategory.value) {
        Swal.fire({
            icon: "error",
            title: "Missing Required Fields",
            text: "Please fill all required fields (Product ID, Product Name, Product Price, Product Category)",
        });
        return;
    }

    if (
        Number(productId.value) <= 0 ||
        Number(productPrice.value) < 0 ||
        Number(productTaxes.value) < 0 ||
        Number(productAds.value) < 0 ||
        Number(productDiscount.value) < 0 ||
        Number(productCount.value) < 0
    ) {
        Swal.fire({
            icon: "error",
            title: "Invalid Input",
            text: "Price, Taxes, Ads, Discount, and Count must be Positive numbers.",
        });
        return;
    }

    let existingProduct = products.find((product) => {
        return product.id === Number(productId.value);
    });

    if (editingProductIndex !== null) {
        products[editingProductIndex] = {
            id: Number(productId.value),
            name: productName.value.trim(),
            price: Number(productPrice.value),
            taxes: Number(productTaxes.value),
            ads: Number(productAds.value),
            discount: Number(productDiscount.value),
            count: Number(productCount.value),
            category: productCategory.value.trim(),
        };
        editingProductIndex = null;
        submitBtn.textContent = "Add Product";
    } else if (existingProduct) {
        existingProduct.price = Number(productPrice.value);
        existingProduct.taxes = Number(productTaxes.value);
        existingProduct.ads = Number(productAds.value);
        existingProduct.discount = Number(productDiscount.value);

        existingProduct.count += Number(productCount.value);
    } else {
        products.push({
            id: Number(productId.value),
            name: productName.value.trim(),
            price: Number(productPrice.value),
            taxes: Number(productTaxes.value),
            ads: Number(productAds.value),
            discount: Number(productDiscount.value),
            count: Number(productCount.value),
            category: productCategory.value.trim(),
        });
    }

    clearInputs();
    updateTotal();
    refreshUI();
});

// Reduce Product Count
productsTableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("reduce-btn")) {
        let index = e.target.getAttribute("data-index");
        if (products[index].count >= 1) {
            products[index].count -= 1;
            if (products[index].count === 0) {
                products.splice(index, 1);
            }
            refreshUI();
        }
    }
});

// Delete Product
productsTableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
        let index = e.target.getAttribute("data-index");
        products.splice(index, 1);
        refreshUI();
    }
});

// Delete All Products
let deleteAllBtn = document.getElementById("delete-all-btn");
deleteAllBtn.textContent = "Delete All";
deleteAllBtn.style.display = products.length > 0 ? "block" : "none";

deleteAllBtn.addEventListener("click", () => {
    products.splice(0);
    localStorage.removeItem("products");
    displayProducts(products);
    deleteAllBtn.style.display = products.length > 0 ? "block" : "none";
});
