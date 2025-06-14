import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, ChevronLeft } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Layout } from "@/components/layout/layout";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import React, { useRef } from "react"; 
import { toast } from "sonner"; 
import jsPDF from 'jspdf'; 
import html2canvas from 'html2canvas'; 

const workplaceAgreementSchema = z.object({
  caseFileNumber: z.string().min(1, "Case file selection is required."),
  party1Name: z.string().min(1, "Party 1 name is required."),
  party2Name: z.string().min(1, "Party 2 name is required."),
  additionalAttendees: z.string().optional(),
  mediationOnline: z.boolean().default(false),
  virtualMeetingPlatform: z.string().optional(),
  feesPayer: z.string().min(1, "Fees payer information is required."),
  agreementDate: z.date({ required_error: "Agreement date is required." }),
  party1Signature: z.string().min(1, "Party 1 signature is required."),
  party2Signature: z.string().min(1, "Party 2 signature is required."),
  mediatorSignature: z.string().min(1, "Mediator signature is required."),
});

type WorkplaceAgreementValues = z.infer<typeof workplaceAgreementSchema>;

// Placeholder data - replace with actual data from your service/API
const caseFiles = [
  { value: "CF001", label: "CF001 - Smith v Jones" },
  { value: "CF002", label: "CF002 - Acme Corp v Beta LLC" },
  { value: "CF003", label: "CF003 - Community Dispute Alpha" },
  { value: "WRK001", label: "WRK001 - Employee v Employer A" },
  { value: "WRK002", label: "WRK002 - Department X v Department Y" },
];

const WorkplaceAgreement = () => {
  const form = useForm<WorkplaceAgreementValues>({
    resolver: zodResolver(workplaceAgreementSchema),
    defaultValues: {
      party1Name: "",
      party2Name: "",
      additionalAttendees: "",
      mediationOnline: false,
      virtualMeetingPlatform: "",
      feesPayer: "",
      party1Signature: "",
      party2Signature: "",
      mediatorSignature: "",
    },
  });
  const isMobile = useIsMobile();
  const formRef = useRef<HTMLFormElement>(null);

  function onSave(data: WorkplaceAgreementValues) {
    console.log("Workplace Agreement Data:", JSON.stringify(data, null, 2));
    toast.success("Workplace Agreement data saved (simulated).");
  }

  const handleDownloadPdf = async () => {
    const formElement = formRef.current;
    if (!formElement) {
        toast.error("Form element not found. Cannot generate PDF.");
        return;
    }

    toast.info("Generating PDF, please wait...", { duration: 5000 });

    const downloadButton = document.getElementById("download-pdf-button-workplace");
    const saveButton = document.getElementById("save-agreement-button-workplace");
    
    const originalDownloadDisplay = downloadButton ? downloadButton.style.display : '';
    const originalSaveDisplay = saveButton ? saveButton.style.display : '';

    if (downloadButton) downloadButton.style.display = 'none';
    if (saveButton) saveButton.style.display = 'none';

    try {
        const canvas = await html2canvas(formElement, {
            scale: 2, 
            useCORS: true,
            logging: false, 
            windowWidth: formElement.scrollWidth,
            windowHeight: formElement.scrollHeight,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
        });

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const pageMargin = 10; 

        const availableWidth = pdfWidth - (2 * pageMargin);
        const imgRenderWidth = availableWidth;
        const imgRenderHeight = (imgProps.height * imgRenderWidth) / imgProps.width;

        let heightLeft = imgRenderHeight;
        let position = 0; 

        pdf.addImage(imgData, 'PNG', pageMargin, pageMargin + position, imgRenderWidth, imgRenderHeight);
        heightLeft -= (pdfHeight - (2 * pageMargin));

        while (heightLeft > 0) {
            position -= (pdfHeight - (2 * pageMargin)); 
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', pageMargin, pageMargin + position, imgRenderWidth, imgRenderHeight);
            heightLeft -= (pdfHeight - (2 * pageMargin));
        }

        pdf.save('WorkplaceAgreement.pdf');
        toast.success("PDF downloaded successfully!");

    } catch (error) {
        console.error("Error generating PDF for Workplace Agreement:", error);
        toast.error("Failed to generate PDF. See console for details.");
    } finally {
        if (downloadButton) downloadButton.style.display = originalDownloadDisplay;
        if (saveButton) saveButton.style.display = originalSaveDisplay;
    }
};


  return (
    <Layout>
      <div className={`flex flex-col ${isMobile ? "space-y-4" : "space-y-6"} pb-10`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link to="/templates">
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold tracking-tight`}>Organisational & Workplace Agreement Builder</h1>
              <p className="text-muted-foreground text-sm">
                Create an Organisational & Workplace Agreement to Mediate.
              </p>
            </div>
          </div>
        </div>

        <Card className="w-full max-w-5xl mx-auto shadow-lg">
          <CardHeader className="bg-gray-50 p-6 rounded-t-lg">
            <CardTitle className="text-3xl font-bold text-center text-gray-800">Organisational & Workplace Agreement to Mediate</CardTitle>
            <CardDescription className="text-center text-gray-600 mt-1">
              Please fill in the details below to generate the agreement.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)} ref={formRef} className="space-y-8">
              <CardContent className="p-6 md:p-8 space-y-6">
                <FormField
                  control={form.control}
                  name="caseFileNumber"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel className="text-lg font-semibold text-gray-700">Link to Case</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a case file" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {caseFiles.map((file) => (
                            <SelectItem key={file.value} value={file.value}>
                              {file.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2 p-4 border border-gray-200 rounded-md bg-white">
                  <p className="text-gray-700">This document relates to a Mediation process between:</p>
                  <FormField
                    control={form.control}
                    name="party1Name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-gray-600">PARTY 1</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter name of Party 1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <p className="text-gray-700">and</p>
                  <FormField
                    control={form.control}
                    name="party2Name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-gray-600">PARTY 2</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter name of Party 2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="additionalAttendees"
                    render={({ field }) => (
                      <FormItem className="mt-2">
                        <FormLabel className="font-medium text-gray-600">Additional Attendees (If applicable)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Insert Name, address, and relationship of any additional attendees e.g., Union official" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
                  <p>Mediation is a process in which an independent, neutral Mediator assists two or more disputing parties in resolving the dispute in a collaborative, consensual manner.</p>
                  
                  <h2 className="text-xl font-semibold text-gray-800 pt-4">The Mediator</h2>
                  <p>The Parties Agree to the Mediator conducting the Mediation process. The Mediator is accredited to the Mediators’ Institute of Ireland and acting in accordance with its Code of Ethics and Practice (available at www.themii.ie ). The Mediator will act as an impartial facilitator to assist the parties in a negotiation aimed at the resolution of issues between them. All parties will work with the Mediator to isolate points of agreement and disagreement, to identify their interests, to explore alternative solutions and to consider compromises or accommodations. The Mediator is committed to processing parties’ personal information fairly and in compliance with the Code of Ethics and Practice, The Mediation Act 2017, GDPR legislation and Data Protection Act 2018.</p>

                  <h2 className="text-xl font-semibold text-gray-800 pt-4">Parties agree the following:</h2>
                  <ol className="list-decimal list-inside space-y-2 pl-4">
                    <li>I am entering Mediation in good faith and will endeavour to resolve the issues of conflict through this process. To ensure the Mediation is conducted in line with best practice the Mediator may make requests of the parties during the Mediation and/or any caucus/breakout session. I undertake to consider these requests in the interest and spirit of progressing matters in the Mediation in a constructive and respectful manner. I will disclose fully and in a timely manner any information and/or documents relevant to the matters under discussion.</li>
                    <li>I understand that it is for the parties to the Mediation with the Mediator’s concurrence, to determine the scope of the Mediation. I acknowledge that the Mediator will not decide or indicate who is right or who is wrong or make decisions related to the outcome of the Mediation.</li>
                    <li>I understand that the Mediator does not offer advice of any kind and therefore parties are encouraged to exercise their right to obtain independent advice (including legal, financial, tax and any other professional advice) prior to engaging in and during the Mediation process and, most importantly, before signing any Mediated Settlement/Memorandum of Understanding. The onus is on me as a party to the Mediation process to request time to avail of such advice when I consider it appropriate and relevant.</li>
                    <li>As a party to the Mediation process I understand that I may be accompanied to the Mediation and assisted by a person who is not a party. This includes but is not limited to an advisor, supporter or representative and the onus is on me as a party to determine if I require such support.</li>
                    <li>I understand that information gathered in the Mediation process is confidential and privileged. Neither the Mediator nor any party to the Mediation including any accompanying person or persons shall divulge any information gained in the Mediation process nor seek to have the Mediator or any party to the Mediation divulge information relevant to that Mediation in any setting whatsoever. If it is necessary for a third party to be consulted in the context of a solution, prior agreement will be sought from the parties to the dispute.</li>
                    <li>I agree that if the Mediator asks me to break out of the plenary meeting into a private meeting/caucus session, I will do so.</li>
                    <li>If during a Mediation meeting, I believe it is no longer possible to continue with the Mediation, I agree to meet briefly with the Mediator in private session prior to withdrawing.</li>
                    <li>I understand that the Mediator may terminate the Mediation meeting in circumstances where they believe it is not appropriate to proceed.</li>
                    <li>I understand that the confidentiality of the Mediation process shall not excuse the Mediator's duty to act as required to do so by law, to report any threat of or actual physical or psychological injury to a party; attempt to commit or conceal a crime; concern as to welfare and safety of a child or children, revealed during the process.</li>
                    <li>I understand that the Mediator will have opened a file containing details of this Mediation process from our first interactions and that they are obliged to keep this file in a secure place for 7 years after the Mediation concludes.</li>
                    <li>All communications (including oral statements) and all records and notes relating to the Mediation shall be confidential and shall not be disclosed in any proceedings before a court or otherwise. The following are the only exceptions to this - where disclosure is:
                      <ul className="list-disc list-inside pl-6 space-y-1 mt-1">
                        <li>Necessary to implement or enforce a Mediated Settlement/Memorandum of Understanding</li>
                        <li>Necessary to prevent physical or psychological injury to a party</li>
                        <li>Required by law</li>
                        <li>Necessary in the interests of preventing or revealing – the commission of a crime (including an attempt to commit a crime) the concealment of a crime, or a threat to a party</li>
                        <li>Sought or offered to prove or disprove a civil claim concerning the negligence or misconduct of the Mediator occurring during the Mediation or a complaint to a professional body concerning such negligence or misconduct.</li>
                      </ul>
                    </li>
                    <li>I agree that all devices with the capability of recording have their recording capability disabled. This includes mobile phones, cameras, tape recorders or other devices capable of recording such as Amazon Alexa or Google nest. I confirm that I will not record any meetings including caucus/breakout sessions.</li>
                    <li>I agree that the Mediator will not be liable for any mistake or omission made during this Mediation unless this mistake or omission is fraudulent or negligent.</li>
                    <li>
                      <FormField
                        control={form.control}
                        name="mediationOnline"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                I agree to the Mediation taking place online.
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    </li>
                  </ol>

                  {form.watch("mediationOnline") && (
                    <div className="mt-4 p-4 border border-dashed border-blue-300 rounded-md bg-blue-50">
                      <h3 className="text-lg font-semibold text-blue-700 mb-2">Virtual Meetings</h3>
                      <ol className="list-[lower-alpha] list-inside space-y-1 pl-4 text-sm text-gray-700">
                        <li>Parties involved in virtual meetings are required to comply with GDPR legislation and Data Protection Act 2018.</li>
                        <li>Where all parties and the Mediator agree to a virtual meeting, each is committing that that they will not make any digital/audio recordings of online meetings nor permit any meeting participants to make any digital recording of confidential meetings. This includes caucus/breakout sessions.</li>
                        <li>
                          In agreeing to take part in Mediation via virtual platform, parties are confirming their technical competence in
                          <FormField
                            control={form.control}
                            name="virtualMeetingPlatform"
                            render={({ field }) => (
                              <FormItem className="inline-block ml-1">
                                <FormControl>
                                  <Input className="inline-block w-auto h-7 px-2 py-1 text-sm" placeholder="e.g., Zoom/Webex/Microsoft Teams" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                           to take part on a virtual platform.
                        </li>
                        <li>Parties and the Mediator commit to conducting the virtual Mediation and any related caucus or breakout session in an enclosed, private space where they cannot be overheard, seen, or monitored either in person or electronically by a third party not involved in the Mediation.</li>
                        <li>All parties agree to identify all persons who are present in the room at any time during the Mediation or caucus/breakout session.</li>
                        <li>All parties attending a virtual meeting agree not to share the login details of the virtual meeting with any other person.</li>
                      </ol>
                    </div>
                  )}
                  
                  <p className="pt-4">Parties will treat each other respectfully and will be mindful of gestures, tone, and language throughout the process.</p>
                  
                  <div className="pt-4">
                    <p className="inline">Mediation Fees will be agreed separately with</p> {/* Changed to inline */} 
                    <FormField
                      control={form.control}
                      name="feesPayer"
                      render={({ field }) => (
                        <FormItem className="inline-block mx-1">
                          <FormControl>
                            <Input className="inline-block w-auto h-8 px-2 py-1" placeholder="Person/organisation paying fees" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <p className="inline">who will be responsible for paying the Mediator fees.</p>
                  </div>

                  <p className="pt-4">The undersigned, having read and understood the above, consent to participating in Mediation.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                    <FormField
                      control={form.control}
                      name="agreementDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="font-medium text-gray-600">Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    <FormField
                      control={form.control}
                      name="party1Signature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-gray-600">Party 1 - Signature (Typed Name)</FormLabel>
                          <FormControl>
                            <Input placeholder="Type name for Party 1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="party2Signature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-gray-600">Party 2 - Signature (Typed Name)</FormLabel>
                          <FormControl>
                            <Input placeholder="Type name for Party 2" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mediatorSignature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-gray-600">Mediator - Signature (Typed Name)</FormLabel>
                          <FormControl>
                            <Input placeholder="Type name for Mediator" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <p className="text-xs text-gray-500 pt-6">
                    NOTE: If Mediation is to take place on a digital platform, parties’ agreement to the terms here within can be confirmed via email to the Mediator.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="p-6 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
                <Button 
                  id="save-agreement-button-workplace"
                  type="submit" 
                  variant="outline"
                  className="w-full md:w-auto"
                >
                  Save Agreement
                </Button>
                <Button 
                  id="download-pdf-button-workplace"
                  type="button" 
                  onClick={handleDownloadPdf}
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Generate PDF
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </Layout>
  );
};

export default WorkplaceAgreement;
