// 最近見た商品の共通管理オブジェクト
window.RecentlyViewed = {
  EXPIRY_TIME: 60 * 60 * 1000, // 1時間

  // 商品を記録する
  record: function(productData) {
    if (!productData || !productData.handle) return;
    let products = this.getList();
    
    // 重複を削除して先頭に追加
    products = products.filter(item => item.handle !== productData.handle);
    products.unshift(productData);
    
    // 最大15件保存（表示の材料を確保）
    products = products.slice(0, 15);

    localStorage.setItem('recentlyViewed', JSON.stringify({
      timestamp: Date.now(),
      products: products
    }));
  },

  // リストを取得する
  getList: function() {
    const stored = localStorage.getItem('recentlyViewed');
    if (!stored) return [];
    try {
      const parsed = JSON.parse(stored);
      // 有効期限チェック
      if (Date.now() - parsed.timestamp > this.EXPIRY_TIME) {
        localStorage.removeItem('recentlyViewed');
        return [];
      }
      return parsed.products || [];
    } catch (e) {
      localStorage.removeItem('recentlyViewed');
      return [];
    }
  },

  // 画面に表示する（HTML生成）
  render: function(containerId, currentHandle = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const products = this.getList();
    const displayLimit = parseInt(container.getAttribute('data-limit')) || 6;
    
    const filteredProducts = currentHandle 
      ? products.filter(item => item.handle !== currentHandle)
      : products;

    const limitedProducts = filteredProducts.slice(0, displayLimit);

    if (limitedProducts.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';
    const productList = container.querySelector('.recently-viewed-list');
    if (!productList) return;

    // Shopifyのシンプルな画像placeholder（フレームアイコン）
    const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 525.5 525.5"><path fill="#f4f4f4" d="M0 0h525.5v525.5H0z"/><g fill-rule="evenodd" clip-rule="evenodd"><path d="M324.5 212.7H203c-1.6 0-2.8 1.3-2.8 2.8V308c0 1.6 1.3 2.8 2.8 2.8h121.6c1.6 0 2.8-1.3 2.8-2.8v-92.5c0-1.6-1.3-2.8-2.9-2.8zm-1.1 92.2h-119.5v-90.4h119.6V305z" fill="#fff"/><path d="m305.1 246.3-35.5 44.4-23.6-28.2-25.9 30.6V305h109.4v-8.7l-24.4-50z" fill="#fff"/><circle cx="253.8" cy="242.4" r="10.8" fill="#fff"/></g></svg>`;

    productList.innerHTML = limitedProducts.map((product, index) => {
      // 画像の判定
      const isValidImage = product.image && product.image !== "" && !product.image.includes('no-image');
      
      // セール判定
      const isSale = product.compare_at_price && product.compare_at_price !== "" && product.compare_at_price !== product.price;

      // Saleバッジ
      const saleBadge = isSale ? `<div class="absolute top-2 left-2 bg-red-500 text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10">SALE</div>` : '';

      // 画像またはプレースホルダーを表示
      let imageContent;
      if (isValidImage) {
        imageContent = `
          <img 
            src="${product.image}" 
            alt="${product.title}" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 js-recently-viewed-img" 
            data-index="${index}"
            loading="lazy">
          <div class="w-full h-full bg-gray-200 flex items-center justify-center js-recently-viewed-placeholder" data-index="${index}" style="display:none;">
            ${placeholderSvg}
          </div>
        `;
      } else {
        imageContent = `<div class="w-full h-full bg-gray-200 flex items-center justify-center">${placeholderSvg}</div>`;
      }

      return `
        <a href="${product.url}" class="block group">
          <div class="aspect-square rounded-lg overflow-hidden mb-3 relative">
            ${saleBadge}
            ${imageContent}
          </div>
          <h4 class="text-[11px] md:text-sm font-medium text-gray-900 leading-tight mb-1 line-clamp-2 min-h-[2.5em]">${product.title}</h4>
          <p class="text-[11px] md:text-sm text-gray-600 font-bold">${product.price}</p>
        </a>
      `;
    }).join('');

    // 画像エラー時のフォールバック処理を追加
    setTimeout(() => {
      const images = productList.querySelectorAll('.js-recently-viewed-img');
      images.forEach(img => {
        img.addEventListener('error', function() {
          const index = this.getAttribute('data-index');
          const placeholder = productList.querySelector(`.js-recently-viewed-placeholder[data-index="${index}"]`);
          if (placeholder) {
            this.style.display = 'none';
            placeholder.style.display = 'flex';
          }
        });
      });
    }, 0);
  }
};
