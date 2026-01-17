/**
 * Shopify Cart API Wrapper
 * カート操作のための統一API
 */

class CartAPI {
  constructor() {
    this.cart = null;
  }

  /**
   * カート情報を取得
   */
  async getCart() {
    try {
      const response = await fetch('/cart.js');
      this.cart = await response.json();
      return this.cart;
    } catch (error) {
      console.error('Cart fetch error:', error);
      throw error;
    }
  }

/**
   * カートに商品を追加
   * @param {Object} data - { id: variantId, quantity: 1, properties: {} }
   */
  async addToCart(data) {
    try {
      // items形式に変換
      const requestData = {
        items: [data]
      };
      
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.description || error.message || 'カートへの追加に失敗しました');
      }

      const result = await response.json();
      await this.getCart(); // カート情報を更新
      this.updateCartCount();
      return result;
    } catch (error) {
      console.error('Add to cart error:', error);
      throw error;
    }
  }

  /**
   * カート内商品の数量を変更
   * @param {string} key - cart item key
   * @param {number} quantity - new quantity
   */
  async updateItem(key, quantity) {
    try {
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: key,
          quantity: quantity
        })
      });

      if (!response.ok) {
        throw new Error('カートの更新に失敗しました');
      }

      const result = await response.json();
      this.cart = result;
      this.updateCartCount();
      return result;
    } catch (error) {
      console.error('Update cart error:', error);
      throw error;
    }
  }

  /**
   * カート属性を更新（ギフトオプションなど）
   * @param {Object} attributes - { key: value }
   */
  async updateAttributes(attributes) {
    try {
      const response = await fetch('/cart/update.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attributes: attributes
        })
      });

      if (!response.ok) {
        throw new Error('カート属性の更新に失敗しました');
      }

      const result = await response.json();
      this.cart = result;
      return result;
    } catch (error) {
      console.error('Update attributes error:', error);
      throw error;
    }
  }

  /**
   * カートをクリア
   */
  async clearCart() {
    try {
      const response = await fetch('/cart/clear.js', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('カートのクリアに失敗しました');
      }

      await this.getCart();
      this.updateCartCount();
    } catch (error) {
      console.error('Clear cart error:', error);
      throw error;
    }
  }

  /**
   * ヘッダーのカート数を更新
   */
  updateCartCount() {
    if (this.cart) {
      const itemCount = this.cart.items.reduce((count, item) => {
    if (item.product_title === 'ギフトラッピング') {
      return count;
    }
     return count + item.quantity;
  }, 0);
      
      // スクロール前のカート数
      const cartCountElement = document.getElementById('cart-count');
      if (cartCountElement) {
        cartCountElement.textContent = itemCount;
        if (itemCount > 0) {
          cartCountElement.classList.remove('hidden');
        } else {
          cartCountElement.classList.add('hidden');
        }
      }
      
      // スクロール後のカート数
      const cartCountScrolled = document.getElementById('cart-count-scrolled');
      if (cartCountScrolled) {
        cartCountScrolled.textContent = itemCount;
        if (itemCount > 0) {
          cartCountScrolled.classList.remove('hidden');
        } else {
          cartCountScrolled.classList.add('hidden');
        }
      // 【追加】スマホ用のカート数
      const cartCountMobile = document.getElementById('cart-count-mobile');
      if (cartCountMobile) {
        cartCountMobile.textContent = itemCount;
        if (itemCount > 0) {
          cartCountMobile.classList.remove('hidden');
        } else {
          cartCountMobile.classList.add('hidden');
        }

      }
    }
  }

  /**
   * トースト通知を表示
   * @param {string} message - 表示するメッセージ
   * @param {string} type - 'success' | 'error' | 'info'
   */
  showToast(message, type = 'success') {
    // 既存のトーストを削除
    const existingToast = document.getElementById('cart-toast');
    if (existingToast) {
      existingToast.remove();
    }

    // トースト要素を作成
    const toast = document.createElement('div');
    toast.id = 'cart-toast';
    toast.className = `fixed top-20 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-0`;
    
    // タイプに応じた色を設定
    const colors = {
      success: 'bg-green-600 text-white',
      error: 'bg-red-600 text-white',
      info: 'bg-stone-800 text-white'
    };
    
    toast.className += ` ${colors[type] || colors.info}`;
    toast.innerHTML = `
      <div class="flex items-center gap-3">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          ${type === 'success' 
            ? '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>'
            : '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>'
          }
        </svg>
        <span class="font-medium">${message}</span>
      </div>
    `;

    document.body.appendChild(toast);

    // 3秒後にフェードアウト
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// グローバルインスタンスを作成
window.cartAPI = new CartAPI();

// ページロード時にカート情報を取得
document.addEventListener('DOMContentLoaded', () => {
  window.cartAPI.getCart();
});
