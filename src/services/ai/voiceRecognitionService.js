import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Permissions from 'expo-permissions';
import axios from 'axios';

/**
 * Сервис для распознавания голоса и преобразования речи в текст
 */
class VoiceRecognitionService {
  constructor() {
    this.recording = null;
    this.sound = null;
    this.isRecording = false;
    this.recordingUri = null;
  }

  /**
   * Запрашивает разрешения на использование микрофона
   * @returns {Promise<boolean>} - Результат запроса разрешений
   */
  async requestPermissions() {
    try {
      const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting audio permissions:', error);
      return false;
    }
  }

  /**
   * Начинает запись голоса
   * @returns {Promise<boolean>} - Успешность начала записи
   */
  async startRecording() {
    try {
      // Проверяем разрешения
      const hasPermissions = await this.requestPermissions();
      if (!hasPermissions) {
        throw new Error('Нет разрешения на запись аудио');
      }

      // Настраиваем объект записи
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });

      // Создаем новую запись
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.startAsync();

      this.recording = recording;
      this.isRecording = true;

      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      return false;
    }
  }

  /**
   * Останавливает запись голоса
   * @returns {Promise<string|null>} - URI файла записи или null в случае ошибки
   */
  async stopRecording() {
    try {
      if (!this.recording || !this.isRecording) {
        throw new Error('Запись не была начата');
      }

      // Останавливаем запись
      await this.recording.stopAndUnloadAsync();
      
      // Получаем URI файла записи
      const uri = this.recording.getURI();
      this.recordingUri = uri;
      
      // Сбрасываем состояние записи
      this.isRecording = false;
      
      // Возвращаем аудио режим в исходное состояние
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      return uri;
    } catch (error) {
      console.error('Error stopping recording:', error);
      this.isRecording = false;
      return null;
    }
  }

  /**
   * Воспроизводит записанный голос
   * @returns {Promise<boolean>} - Успешность воспроизведения
   */
  async playRecording() {
    try {
      if (!this.recordingUri) {
        throw new Error('Нет записи для воспроизведения');
      }

      // Создаем объект звука
      const { sound } = await Audio.Sound.createAsync(
        { uri: this.recordingUri },
        { shouldPlay: true }
      );
      
      this.sound = sound;
      
      // Ожидаем окончания воспроизведения
      await new Promise((resolve) => {
        this.sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            resolve();
          }
        });
      });
      
      // Выгружаем звук
      await this.sound.unloadAsync();
      this.sound = null;

      return true;
    } catch (error) {
      console.error('Error playing recording:', error);
      return false;
    }
  }

  /**
   * Преобразует записанный голос в текст с использованием API распознавания речи
   * @param {string} language - Язык речи (по умолчанию 'ru-RU')
   * @returns {Promise<string|null>} - Распознанный текст или null в случае ошибки
   */
  async transcribeRecording(language = 'ru-RU') {
    try {
      if (!this.recordingUri) {
        throw new Error('Нет записи для преобразования в текст');
      }

      // Читаем файл записи
      const fileInfo = await FileSystem.getInfoAsync(this.recordingUri);
      if (!fileInfo.exists) {
        throw new Error('Файл записи не найден');
      }

      // Конвертируем аудио файл в base64
      const base64Audio = await FileSystem.readAsStringAsync(this.recordingUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Отправляем запрос к API распознавания речи (пример с использованием OpenAI Whisper через OpenRouter)
      const response = await axios.post(
        'https://openrouter.ai/api/v1/audio/transcriptions',
        {
          file: base64Audio,
          model: 'openai/whisper',
          language: language.split('-')[0], // Извлекаем основной код языка (ru из ru-RU)
        },
        {
          headers: {
            'Authorization': `Bearer YOUR_OPENROUTER_API_KEY`, // Будет заменено на реальный ключ
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://ai-expense-logger.app', // Заменить на реальный домен
            'X-Title': 'AI Expense Logger'
          }
        }
      );

      // Извлекаем распознанный текст из ответа
      return response.data.text;
    } catch (error) {
      console.error('Error transcribing recording:', error);
      
      // В случае ошибки API, можно использовать локальное распознавание или другие API
      // Здесь можно добавить запасной вариант
      
      return null;
    }
  }

  /**
   * Очищает ресурсы записи
   */
  async cleanup() {
    try {
      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
        this.recording = null;
      }
      
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }
      
      if (this.recordingUri) {
        await FileSystem.deleteAsync(this.recordingUri, { idempotent: true });
        this.recordingUri = null;
      }
      
      this.isRecording = false;
    } catch (error) {
      console.error('Error cleaning up voice recognition resources:', error);
    }
  }
}

export default new VoiceRecognitionService();
