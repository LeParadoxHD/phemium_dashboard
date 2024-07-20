import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, switchMap, tap } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { IDocument, PaginatedResponse } from 'src/app/state/interfaces';
import { ReportsState } from 'src/app/state/store';

export const PREVIEW_SUFFIX = '_PREVIEW';
export const IMPORT_SUFFIX = '_IMPORT';
export const TOOL_SUFFIX = '_TOOL';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  constructor(private commonService: CommonService, private store: Store, private apiService: ApiService) {
    this.documents$ = this.commonService.currentEnvironment$.pipe(
      switchMap((env) => this.store.select(ReportsState.GetDocuments(env)))
    );
  }

  documents$: Observable<IDocument[]>;

  async runPreviewWithinConsultation(consultationId: number, document: IDocument) {
    /**
     * Get consultation information
     */
    const consultationResponse = await this.apiService.requestPromise<any>({
      entity: 'consultations',
      method: 'get_consultation',
      parameters: [consultationId]
    });
    if (consultationResponse.ok) {
      const { body: consultation } = consultationResponse;
      // Find main consultant id
      const mainConsultantId =
        consultation.consultants.find((c) => c.id === consultation.main_consultant_id)?.id || null;
      // Get datetime offset
      const dateTimeOffset = new Date().getTimezoneOffset();
      let previewReportId = null;
      try {
        const previewReport = await this.getReportForPreview(document);
        previewReportId = previewReport.id;
        const { body: consultationItemId } = await this.apiService.requestPromise<number>({
          entity: 'consultations',
          method: 'generate_report',
          parameters: [consultationId, mainConsultantId, 'es', dateTimeOffset, previewReport.id, false, false]
        });
        if (consultationItemId) {
          const reportItem = await this.getReportItem(consultationItemId);
          return reportItem;
        }
      } finally {
        if (previewReportId) {
          await this.deleteReport(previewReportId);
        }
      }
    }
  }

  /**
   * Ensures a preview report exists for the given preview document
   * If it does not exist, it creates a new cloned document with the preview code
   * @param document
   * @returns
   */
  async getReportForPreview(document: IDocument): Promise<IDocument> {
    // Check if preview report exists
    const previewReportResponse = await this.apiService.requestPromise<PaginatedResponse<IDocument>>({
      entity: 'documents',
      method: 'get_documents',
      parameters: [
        {
          filters: [
            {
              column: 'external_id',
              operator: 'equals',
              value: document.external_id + PREVIEW_SUFFIX
            }
          ]
        }
      ]
    });
    if (!previewReportResponse.ok) {
      throw new Error('Unable to retrieve preview report');
    }
    if (previewReportResponse.ok) {
      const { body: previewReport } = previewReportResponse;
      if (previewReport.items.length > 0) {
        const existingPreview = previewReport.items[0];
        // Update existing document
        return await this.updateReport({
          ...existingPreview,
          content: document.content
        });
      } else {
        // Create clone document with preview code
        return await this.createReport({
          ...document,
          external_id: document.external_id + PREVIEW_SUFFIX
        });
      }
    }
  }

  async updateReport(document: IDocument) {
    const { body: result } = await this.apiService.requestPromise<IDocument>({
      entity: 'documents',
      method: 'update_document',
      parameters: [document]
    });
    return result;
  }

  async createReport(document: IDocument) {
    const { id, ...cloneDocument } = document;
    const { body: result } = await this.apiService.requestPromise<IDocument>({
      entity: 'documents',
      method: 'create_document',
      parameters: [cloneDocument]
    });
    return result;
  }

  async deleteReport(documentId: number) {
    const { body: result } = await this.apiService.requestPromise<boolean>({
      entity: 'documents',
      method: 'delete_document',
      parameters: [documentId]
    });
    return result;
  }

  async getReportItem(consultationItemId: number) {
    const { body: result } = await this.apiService.requestPromise<any>({
      entity: 'consultations',
      method: 'get_consultation_item',
      parameters: [consultationItemId]
    });
    return result;
  }
}
