class BlogPost extends HTMLElement {
  connectedCallback() {
    const { title, link, image, category, date, index } = this.attributes;

    this.classList.add('blog-post');
    if (index.value < 2) {
      this.classList.add('col-lg-6', 'col-md-6', 'col-12');
      this.innerHTML = `
          <div class="news-thumb mb-4">
              <a href="${link.value}" target="_blank">
                  <img
                      src="${image.value}"
                      class="img-fluid news-image"
                      alt="${title.value}"
                  >
              </a>

              <div class="news-text-info news-text-info-large">
                  <span class="category-tag bg-danger">${category.value}</span>

                  <h5 class="news-title mt-2">
                      <a href="news-detail.html" class="news-title-link">
                          ${title.value}
                      </a>
                  </h5>
              </div>
          </div>
      `;
    } else {
      this.classList.add('col-lg-4', 'col-md-4', 'col-12');
      this.innerHTML = `
          <div class="news-thumb mb-lg-0 mb-lg-4 mb-0">
              <a href="${link.value}">
                  <img
                      src="${image.value}"
                      class="img-fluid news-image"
                      alt="${title.value}"
                  >
              </a>

              <div class="news-text-info">
                  <span class="category-tag me-3 bg-info">${category.value}</span>

                  <strong>${moment(date.value).format('MMMM Do @ hh:mm a')}</strong>

                  <h5 class="news-title mt-2">
                      <a href="news-detail.html" class="news-title-link">
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
