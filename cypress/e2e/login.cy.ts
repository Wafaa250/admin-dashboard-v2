describe('Login E2E', () => {

  beforeEach(() => {
    cy.visit('http://localhost:4200/auth/login');
  });

  it('should display login page', () => {
    cy.get('h1').should('contain', 'Admin Dashboard');
  });

  it('should login and redirect to dashboard', () => {
    cy.get('input[formControlName="username"]').type('wafaa');
    cy.get('input[formControlName="password"]').type('wafaa123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should show error with wrong credentials', () => {
    cy.get('input[formControlName="username"]').type('wafaa');
    cy.get('input[formControlName="password"]').type('wrongpass');
    cy.get('button[type="submit"]').click();
    cy.get('.error-alert').should('contain', 'Invalid username or password');
  });

  it('should disable button when form is empty', () => {
    cy.get('button[type="submit"]').should('be.disabled');
  });

});