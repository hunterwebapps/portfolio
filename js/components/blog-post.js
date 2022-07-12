class BlogPost extends HTMLElement {
  connectedCallback() {
    const { title, link, image, category, date, index } = this.attributes;

    this.classList.add('blog-post');
    if (index.value < 2) {
      this.classList.add('col-lg-6', 'col-md-6', 'col-12');
      this.innerHTML = `
          <div class="blog-thumb mb-4">
              <a href="${link.value}" target="_blank">
                  <img
                      src="${image.value}"
                      class="img-fluid blog-image"
                      alt="${title.value}"
                  >
              </a>

              <div class="blog-text-info blog-text-info-large">
                  <span class="category-tag bg-danger">${category.value}</span>

                  <h5 class="mt-2">
                      <a href="${link.value}" class="blog-title-link" target="_blank">
                          ${title.value}
                      </a>
                  </h5>
              </div>
          </div>
      `;
    } else {
      this.classList.add('col-lg-4', 'col-md-4', 'col-12');
      this.innerHTML = `
          <div class="blog-thumb mb-lg-0 mb-lg-4 mb-0">
              <a href="${link.value}" target="_blank">
                  <img
                      src="${image.value}"
                      class="img-fluid blog-image"
                      alt="${title.value}"
                  >
              </a>

              <div class="blog-text-info">
                  <span class="category-tag me-3 bg-info">${category.value}</span>

                  <strong>${moment(date.value).format('MMMM Do @ hh:mm a')}</strong>

                  <h5 class="blog-title mt-2">
                      <a href="${link.value}" class="blog-title-link" target="_blank">
                          ${title.value}
                      </a>
                  </h5>
              </div>
          </div>
      `;
    }
  }
}

customElements.define('blog-post', BlogPost);
