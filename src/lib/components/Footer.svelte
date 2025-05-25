<script>
  const currentYear = new Date().getFullYear();
</script>

<footer>
  <div class="footer-container">
    <div class="footer-section">
      <h3>Capture Moments</h3>
      <p>Bringing your memories to life through stunning photography.</p>
    </div>
    
    <div class="footer-section">
      <h3>Quick Links</h3>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/gallery">Gallery</a></li>
        <li><a href="/pricing">Pricing</a></li>
        <li><a href="/services">Services</a></li>
        <li><a href="/book">Book Now</a></li>
      </ul>
    </div>
    
    <div class="footer-section">
      <h3>Connect With Us</h3>
      <div class="social-icons">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i class="fab fa-facebook"></i></a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
        <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" aria-label="Pinterest"><i class="fab fa-pinterest"></i></a>
      </div>
    </div>
    
    <div class="footer-section">
      <h3>Contact</h3>
      <p>Email: contact@capturemoments.com</p>
      <p>Phone: +233 123 456 7890</p>
    </div>
  </div>
  
  <div class="copyright">
    <p>&copy; {currentYear} Capture Moments Photography. All rights reserved.</p>
  </div>
</footer>

<style>
  footer {
    background-color: #1a1a1a;
    color: #fff;
    padding: 3rem 0 1rem 0;
    width: 100%;
    font-family: 'Playfair Display', serif;
  }
  
  .footer-container {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    padding: 0 2rem;
  }
  
  .footer-section h3 {
    color: #f8f8f8;
    margin-bottom: 1rem;
    font-size: 1.2rem;
    position: relative;
  }
  
  .footer-section h3::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -8px;
    width: 40px;
    height: 2px;
    background-color: #e67e22;
  }
  
  .footer-section p {
    color: #bbb;
    line-height: 1.6;
    margin-bottom: 0.5rem;
  }
  
  .footer-section ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .footer-section ul li {
    margin-bottom: 0.5rem;
  }
  
  .footer-section ul li a {
    color: #bbb;
    text-decoration: none;
    transition: color 0.3s ease;
  }
  
  .footer-section ul li a:hover {
    color: #e67e22;
  }
  
  .social-icons {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .social-icons a {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #333;
    color: #fff;
    text-decoration: none;
    transition: all 0.3s ease;
  }
  
  .social-icons a:hover {
    background-color: #e67e22;
    transform: translateY(-3px);
  }
  
  .copyright {
    text-align: center;
    padding-top: 2rem;
    margin-top: 2rem;
    border-top: 1px solid #333;
    color: #888;
    font-size: 0.9rem;
  }
  
  @media (max-width: 768px) {
    .footer-container {
      grid-template-columns: 1fr;
      text-align: center;
    }
    
    .footer-section h3::after {
      left: 50%;
      transform: translateX(-50%);
    }
    
    .social-icons {
      justify-content: center;
    }
  }
</style>
