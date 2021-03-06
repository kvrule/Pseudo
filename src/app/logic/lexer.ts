import { Error } from './error';
import { InvalidCharacterError } from './invalid-character-error';
import { Token } from '../models/token';
import * as TokenTypes from './token-type.constants';

export class Lexer {

  private charIndex: number;

  constructor() {
    this.charIndex = 0;
  }

  public lex(source: string): Array<Token> | Error {

    let tokens: Array<Token> = [];

    while (source.length !== 0 && this.charIndex < source.length) {
      let char: string = source.charAt(this.charIndex);
      let singleCharTokenType: string | null = this.getSingleCharacterTokenType(char);
      let compTokenType: string | Error | null = this.getComparatorTokenType(source);

      if (char === ' ') {
        this.charIndex++;
      }
      else if (char === '\t') {
        const error: InvalidCharacterError = new InvalidCharacterError('contains tabs.');
        return error;
      }
      else if (singleCharTokenType !== null) {
        const token: Token = this.createToken(singleCharTokenType);
        tokens.push(token);
        this.charIndex++;
      }
      else if (compTokenType instanceof Error) {
        return compTokenType;
      }
      else if (typeof compTokenType === 'string') {
        tokens.push(this.createToken(compTokenType));
        this.charIndex++;
      }
      else if (this.isDigit(char)) {
        const result: number | Error = this.scanNumber(source);

        if (result instanceof Error) {
          return result;
        }
        else{
          const token: Token = this.createToken(TokenTypes.NUMBER, result);
          tokens.push(token);
        }
      }
      else if (this.isAlphabeticalCharacter(char)) {
        const result: string = this.scanString(source);
        const token: Token = this.createToken(TokenTypes.IDENTIFIER, result);
        tokens.push(token);
      }
      else {
        const errorMessage = `the character '${char}' is not valid.`;
        return new InvalidCharacterError(errorMessage);
      }
    }

    return tokens;
  }

  private getSingleCharacterTokenType(char: string): string | null {

    let tokenType: string | null;

    switch (char) {
      case '\n':
        tokenType = TokenTypes.NEWLINE;
        break;
      case '+':
        tokenType = TokenTypes.PLUS;
        break;
      case '-':
        tokenType = TokenTypes.MINUS;
        break;
      case '*':
        tokenType = TokenTypes.MULTIPLY;
        break;
      case '/':
        tokenType = TokenTypes.DIVIDE;
        break;
      case '^':
        tokenType = TokenTypes.POWER;
        break;
      case '(':
        tokenType = TokenTypes.L_BRACKET;
        break;
      case ')':
        tokenType = TokenTypes.R_BRACKET;
        break;
      case ',':
        tokenType = TokenTypes.COMMA;
        break;
      default:
        tokenType = null;
        break;
    }

    return tokenType;
  }

  private getComparatorTokenType(source: string): string | Error | null {

    const char = source.charAt(this.charIndex);

    if (this.charIndex + 1 >= source.length) {
      if (char === '=') {
        const errorMessage: string = `can not end line statement with '='.`;
        return new InvalidCharacterError(errorMessage);
      }
      else if (char === '>') {
        const errorMessage: string = `can not end line statement with '>'.`;
        return new InvalidCharacterError(errorMessage);
      }
      else if (char === '<') {
        const errorMessage: string = `can not end line statement with '<'.`;
        return new InvalidCharacterError(errorMessage);
      }
      else {
        return null;
      }
    }
    else {
      if (char === '=' || char === '>' || char === '<') {
        const nextChar: string = source.charAt(this.charIndex + 1);
        return this.getSpecificComparatorTokenType(char, nextChar);
      }
      else {
        return null;
      }
    }
  }

  private getSpecificComparatorTokenType(char: string, nextChar: string): string {

    if (nextChar === '=') {
      this.charIndex++;

      if (char === '=') {
        return TokenTypes.EQUALITY;
      }
      else if (char === '>') {
        return TokenTypes.G_THAN_EQ;
      }
      else {
        return TokenTypes.L_THAN_EQ;
      }
    }
    else {
      if (char === '=') {
        return TokenTypes.EQUALS;
      }
      else if (char === '>') {
        return TokenTypes.G_THAN;
      }
      else {
        return TokenTypes.L_THAN;
      }
    }
  }

  private createToken(type: string, value?: any): Token {

    let token: Token;

    if (value === undefined) {
      token = { type: type };
    }
    else {
      token = {
        type: type,
        value: value
      };
    }

    return token;
  }

  private isDigit(x: string): boolean {

    if (x.length === 0 || x.length > 1) { return false; }

    return x >= '0' && x <= '9';
  }

  private scanNumber(source: string): number | Error {

    let char: string = source.charAt(this.charIndex);
    let value: string = '';
    let numberOfDots = 0;

    while ((char === '.' || this.isDigit(char)) && this.charIndex < source.length) {
      if (char === '.') {
        numberOfDots++;
      }

      value = value + char;

      this.charIndex++;
      char = source.charAt(this.charIndex);
    }

    if (numberOfDots > 1) {
      const errorMessage = 'number has more than one decimal point.';
      const error: InvalidCharacterError = new InvalidCharacterError(errorMessage);

      return error;
    }
    else {
      return parseFloat(value);
    }
  }

  private isAlphabeticalCharacter(char: string): boolean {

    if (char.length === 0 || char.length > 1) { return false; }

    // Javascript maps lower case letters to upper case with these built in
    // functions, hence can be used as a check for alphabetical letters.
    return char.toUpperCase() != char.toLowerCase();
  }

  private scanString(source: string): string {

    let char: string = source.charAt(this.charIndex);
    let value: string = '';

    while (this.isAlphabeticalCharacter(char) && this.charIndex < source.length) {
      value = value + char

      this.charIndex++;
      char = source.charAt(this.charIndex);
    }

    return value;
  }
}
