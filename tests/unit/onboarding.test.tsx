import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OnboardingPage from "@/app/onboarding/page";

const push=vi.fn();
vi.mock("next/navigation",()=>({useRouter:()=>({push})}));
vi.mock("@clerk/nextjs",()=>({useAuth:()=>({userId:null,isSignedIn:false,isLoaded:true})}));

describe("career profile wizard",()=>{
 beforeEach(()=>{localStorage.clear();push.mockClear()});
 it("collects required personal details and advances to education",async()=>{const user=userEvent.setup();render(<OnboardingPage/>);await screen.findByRole("heading",{name:"Personal Profile"});await user.type(screen.getByLabelText(/full name/i),"Alex Rivera");await user.selectOptions(screen.getByLabelText(/current status/i),"student");await user.click(screen.getByRole("button",{name:/continue/i}));expect(await screen.findByRole("heading",{name:"Education"})).toBeInTheDocument();expect(localStorage.getItem("careertwin-profile-wizard:guest")).toContain("Alex Rivera")});
 it("supports multiple education entries and resumable step navigation",async()=>{const user=userEvent.setup();render(<OnboardingPage/>);await screen.findByRole("heading",{name:"Personal Profile"});await user.click(screen.getByRole("button",{name:/2\. education/i}));await user.click(screen.getByRole("button",{name:/add education/i}));expect(screen.getByText("Education 1")).toBeInTheDocument();await user.type(screen.getByLabelText(/college or institution/i),"Delhi University");expect(localStorage.getItem("careertwin-profile-wizard:guest")).toContain("Delhi University")});
 it("adds a custom skill without inventing proficiency",async()=>{const user=userEvent.setup();render(<OnboardingPage/>);await screen.findByRole("heading",{name:"Personal Profile"});await user.click(screen.getByRole("button",{name:/3\. skills/i}));await user.type(screen.getByLabelText(/search or add a skill/i),"Policy Research");await user.click(screen.getByRole("button",{name:/add “policy research”/i}));expect(screen.getByText("Policy Research")).toBeInTheDocument();expect(localStorage.getItem("careertwin-profile-wizard:guest")).toContain('"proficiency":"beginner"')});
 it("recovers from a corrupted browser draft",async()=>{localStorage.setItem("careertwin-profile-wizard:guest","{not-json");render(<OnboardingPage/>);expect(await screen.findByRole("heading",{name:"Personal Profile"})).toBeInTheDocument();expect(localStorage.getItem("careertwin-profile-wizard:guest")).not.toBe("{not-json")});
 it("save and exit preserves the guest draft and returns home",async()=>{const user=userEvent.setup();render(<OnboardingPage/>);await screen.findByRole("heading",{name:"Personal Profile"});await user.type(screen.getByLabelText(/full name/i),"Alex Rivera");await user.click(screen.getByRole("button",{name:/save & exit/i}));expect(localStorage.getItem("careertwin-profile-wizard:guest")).toContain("Alex Rivera");expect(push).toHaveBeenCalledWith("/")});
});
