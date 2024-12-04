import { Injectable } from '@angular/core';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private safetyModel: any;
  constructor(private http: HttpClient) { 
    this.genAI = new GoogleGenerativeAI(environment.API_KEY_Gemini);
    this.model = this.inicialiseGeminiModel();
    this.safetyModel = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  inicialiseGeminiModel(){
    const generationConfig = {
      safetySettings:[
        {category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE}
      ],
      temperature:0.9,
      top_p:1,
      top_k:32,
      maxOutputTokens:100
    };
    return this.genAI.getGenerativeModel({
      model:'gemini-pro',
      ...generationConfig
    })
  }

  //Aquí llega la reseña
  getResenaResponse(resena: string): Observable<any>{
    return from(this.procesarMensaje(resena));
  }


  //Aquí se procesa la reseña para ver si tiene contenido inapropiado
  private async procesarMensaje(mensaje: string): Promise<string> {
    const verificacion = await this.verificarContenido(mensaje);

    if (!verificacion.safe) {
      return this.formatearRespuestaError(verificacion.reason);
    }

    return this.TestGeminiPro(mensaje);
  }

  //Aquí se procesa la reseña para que la IA la analice y formatee la respuesta
  private async TestGeminiPro(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const texto = await response.text();
      return this.formatearRespuesta(texto);
    } catch (error) {
      console.error("Error en test gemini pro: ", error);
      return "Error al obtener respuesta de Gemini";
    }
  }

  //Aquí se procesa la reseña para ver si tiene contenido inapropiado
  async verificarContenido(texto: string): Promise<{ safe: boolean, reason?: string }> {
    try {
      const result = await this.safetyModel.generateContent({
        contents: [{
          parts: [{
            text: `Analiza si el siguiente texto contiene contenido inapropiado, peligroso o dañino: "${texto}".
                   Responde solo con "SAFE" si es seguro, o describe brevemente por qué no es apropiado.`
          }]
        }]
      });

      const respuesta = await result.response.text();
      const esSeguro = respuesta.trim().toUpperCase() === "SAFE";

      return {
        safe: esSeguro,
        reason: esSeguro ? undefined : "La reseña contiene frases/palabras inapropiadas, peligrosas o dañinas"
      };
    } catch (error: any) {
      return {
        safe: false,
        reason: "La reseña contiene frases/palabras inapropiadas, peligrosas o dañinas"
      };
    }
  }

  //Aquí se formatea la respuesta para que sea más legible, en caso de que no haya contenido inapropiado
  private formatearRespuesta(texto: string): string {
    // Reemplazar los asteriscos dobles con etiquetas HTML
    let formateado = texto.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convertir listas con asteriscos en HTML
    formateado = formateado.replace(/^\* (.*?)$/gm, '<li>$1</li>');

    // Envolver grupos de <li> en <ul>
    formateado = formateado.replace(/((?:<li>.*?<\/li>\n?)+)/g, '<ul>$1</ul>');

    // Agregar saltos de línea HTML
    formateado = formateado.replace(/\n/g, '<br>');

    // Limpiar múltiples saltos de línea consecutivos
    formateado = formateado.replace(/(<br>){3,}/g, '<br><br>');

    return formateado;
  }

  //Aquí se formatea la respuesta para que sea más legible, en caso de que haya contenido inapropiado
  private formatearRespuestaError(razon?: string): string {
    const mensajeBase = `
      <div class="error-message">
        <strong>Lo siento, no puedo procesar esta solicitud</strong><br>
        <p>No se puede guardar la reseña.
        <br>Motivo: ${razon || 'La reseña contiene frases/palabras inapropiadas, peligrosas o dañinas'}</p>
        <p>Por favor, intenta reformular tu reseña de manera más apropiada.</p>
      </div>
    `;

    return mensajeBase.replace(/\n\s+/g, ' ').trim();
  }

  async generarDescripcionLibro(titulo: string, autor: string, isbn: string, anioPublicacion: string): Promise<string> {
    try {
      const prompt = `Genera una descripción breve y concisa (máximo 4 líneas) para un libro con los siguientes datos:
      Título: ${titulo}
      Autor: ${autor}
      ISBN: ${isbn}
      Año: ${anioPublicacion}
      
      No incluyas nada de información del libro (no ISBN, no autor, etc.) , solo la descripción`;

      const result = await this.model.generateContent({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100,  // Limitamos los tokens para respuesta rápida
          topK: 20,
          topP: 0.8
        }
      });

      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error al generar descripción:", error);
      return "No se pudo generar una descripción para este libro.";
    }
  }
}
