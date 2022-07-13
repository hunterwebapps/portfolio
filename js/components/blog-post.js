class BlogPost extends HTMLElement {
    connectedCallback() {
        let { title, link, image, category, date, index } = this.attributes;
        let tagClass = this.attributes['tag-class'];

        tagClass = tagClass || { value: 'bg-danger' };
        index = index || { value: 0 };

        this.classList.add('blog-post');
        if (index.value < 2) {
            this.classList.add('col-lg-6', 'col-md-6', 'col-12');

            const img = `<img src="${image.value}" class="img-fluid blog-image" alt="${title.value}">`;
            const anchorImg = `<a href="${link?.value}" target="_blank">${img}</a>`;
            const anchorTitle = `<a href="${link?.value}" target="_blank">${title.value}</a>`;
            const categoryTag = `<span class="category-tag ${tagClass.value}">${category?.value}</span>`;

            this.innerHTML = `
          <div class="blog-thumb mb-4">
              ${(link?.value ? anchorImg : img)}

              <div class="blog-text-info blog-text-info-large">
                  ${(category?.value ? categoryTag : '')}

                  <h5 class="mt-2 blog-title">
                      ${(link?.value ? anchorTitle : title.value)}
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
                      <a href="${link.value}" target="_blank">
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
